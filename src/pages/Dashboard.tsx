import { useState, useEffect } from "react";
import { Heart, Download, Trash2, Sparkles, Coins, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedImage {
  id: string;
  image_data: string;
  prompt: string;
  liked: boolean;
  created_at: string;
}

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile and credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCredits(profile.credits);
      }

      // Load images
      const { data: userImages } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userImages) {
        setImages(userImages);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (credits < 1) {
      toast.error("Insufficient credits. You need at least 1 credit to generate an image.");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      setImages([data.image, ...images]);
      setCredits(data.remainingCredits);
      toast.success("Image generated successfully!");
      setPrompt("");
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLike = async (id: string) => {
    const image = images.find(img => img.id === id);
    if (!image) return;

    const newLikedState = !image.liked;
    
    setImages(images.map(img => 
      img.id === id ? { ...img, liked: newLikedState } : img
    ));

    const { error } = await supabase
      .from('images')
      .update({ liked: newLikedState })
      .eq('id', id);

    if (error) {
      toast.error("Failed to update like status");
      setImages(images.map(img => 
        img.id === id ? { ...img, liked: !newLikedState } : img
      ));
    }
  };

  const handleDownload = (imageData: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${prompt.substring(0, 30)}.png`;
    link.click();
    toast.success("Download started");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete image");
      return;
    }

    setImages(images.filter(img => img.id !== id));
    toast.success("Image deleted");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Credits Display */}
        <div className="mb-6 flex justify-end">
          <Card className="shadow-soft">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-semibold">{credits}</span>
                <span className="text-sm text-muted-foreground">Credits</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
          {/* Left Pane - Prompt Input */}
          <div className="space-y-4">
            <Card className="shadow-medium">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                      Create Image
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Describe what you want to see (1 credit per image)
                    </p>
                  </div>
                  
                  <Textarea
                    placeholder="A serene landscape with mountains at sunset..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                  
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || credits < 1}
                    variant="hero"
                    size="lg"
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles />
                        Generate Image
                      </>
                    )}
                  </Button>
                  {credits < 1 && (
                    <p className="text-sm text-destructive text-center">
                      You need at least 1 credit to generate an image
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Image Gallery */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Gallery</h2>
            
            {loading ? (
              <Card className="shadow-soft">
                <CardContent className="py-16 text-center">
                  <Sparkles className="animate-spin w-12 h-12 mx-auto text-primary" />
                  <p className="mt-4 text-muted-foreground">Loading your images...</p>
                </CardContent>
              </Card>
            ) : images.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="py-16 text-center">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-hero rounded-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">No images yet</h3>
                    <p className="text-muted-foreground">
                      Start creating amazing AI-generated images by entering a prompt and clicking generate!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {images.map((image) => (
                  <Card key={image.id} className="shadow-soft hover:shadow-medium transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={image.image_data}
                          alt={image.prompt}
                          className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setFullscreenImage(image)}
                        />
                        <div className="flex-1 space-y-2">
                          <p className="font-medium line-clamp-2">{image.prompt}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(image.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={image.liked ? "default" : "outline"}
                              onClick={() => handleLike(image.id)}
                            >
                              <Heart className={image.liked ? "fill-current" : ""} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(image.image_data, image.prompt)}
                            >
                              <Download />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(image.id)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Dialog */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setFullscreenImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            {fullscreenImage && (
              <img
                src={fullscreenImage.image_data}
                alt={fullscreenImage.prompt}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
