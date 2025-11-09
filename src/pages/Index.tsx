import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Palette, Star } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Advanced AI models create stunning, unique images from your descriptions",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate high-quality images in seconds, not hours",
    },
    {
      icon: Palette,
      title: "Unlimited Creativity",
      description: "From realistic photos to abstract art, create anything you imagine",
    },
    {
      icon: Star,
      title: "Easy to Use",
      description: "Simple interface that anyone can master in minutes",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <div className="bg-gradient-primary p-3 rounded-2xl inline-block mb-6">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                ImageGen
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Transform your ideas into stunning visuals with the power of AI. 
              Create, customize, and bring your imagination to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild variant="hero" size="lg" className="text-lg px-8">
                <Link to="/dashboard">
                  Get Started
                  <Sparkles />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/profile">
                  View Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ImageGen?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the next generation of image creation with cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 border border-border/50"
              >
                <div className="bg-gradient-primary p-3 rounded-lg inline-block mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of creators who are already using ImageGen to bring their visions to life
            </p>
            <Button asChild variant="hero" size="lg" className="text-lg px-8">
              <Link to="/dashboard">
                Start Creating Now
                <Sparkles />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
