import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import Replicate from 'https://esm.sh/replicate@0.25.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user credits
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (profile.credits < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Replicate
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Replicate API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    console.log('Generating image with Replicate for prompt:', prompt);

    // Generate image using Flux Schnell
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      }
    ) as string[];

    if (!output || output.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const imageUrl = output[0];
    console.log('Image generated:', imageUrl);

    // Download the image from Replicate
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('Failed to download image from Replicate');
      return new Response(
        JSON.stringify({ error: 'Failed to download generated image' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const imageBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}.webp`;
    const { error: uploadError } = await supabaseClient.storage
      .from('generated-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      console.error('Failed to upload image to storage:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to save image to storage' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('generated-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded to storage:', publicUrl);

    // Deduct 1 credit
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to deduct credits:', updateError);
    }

    // Save image metadata to database
    const { data: savedImage, error: saveError } = await supabaseClient
      .from('images')
      .insert({
        user_id: user.id,
        prompt: prompt,
        image_data: publicUrl,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save image metadata:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save image metadata' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        image: savedImage,
        remainingCredits: profile.credits - 1 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
