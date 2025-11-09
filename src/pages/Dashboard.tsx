import { useState } from "react";
import { Heart, Download, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  liked: boolean;
  createdAt: Date;
}

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    
    // Simulate image generation
    setTimeout(() => {
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: `https://picsum.photos/seed/${Date.now()}/512/512`,
        prompt: prompt,
        liked: false,
        createdAt: new Date(),
      };
      setImages([newImage, ...images]);
      setIsGenerating(false);
      toast.success("Image generated successfully!");
      setPrompt("");
    }, 2000);
  };

  const handleLike = (id: string) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, liked: !img.liked } : img
    ));
  };

  const handleDownload = (url: string, prompt: string) => {
    toast.success("Download started");
    // In a real app, this would trigger actual download
    window.open(url, '_blank');
  };

  const handleDelete = (id: string) => {
    setImages(images.filter(img => img.id !== id));
    toast.success("Image deleted");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
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
                      Describe what you want to see
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
                    disabled={isGenerating}
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Image Gallery */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Gallery</h2>
            
            {images.length === 0 ? (
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
                          src={image.url}
                          alt={image.prompt}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-2">
                          <p className="font-medium line-clamp-2">{image.prompt}</p>
                          <p className="text-sm text-muted-foreground">
                            {image.createdAt.toLocaleDateString()}
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
                              onClick={() => handleDownload(image.url, image.prompt)}
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
    </div>
  );
};

export default Dashboard;
