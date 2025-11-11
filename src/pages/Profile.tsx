import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Image, Heart } from "lucide-react";
import Header from "@/components/Header";
import { AvatarPicker } from "@/components/AvatarPicker";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  credits: number;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserImage {
  id: string;
  prompt: string;
  image_data: string;
  liked: boolean;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      const { data: userImages } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userImages) {
        setImages(userImages);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Sparkles className="animate-spin w-12 h-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const user = {
    name: profile?.display_name || "User",
    email: "",
    profilePicture: profile?.avatar_url || "",
    joinedDate: profile?.created_at ? new Date(profile.created_at) : new Date(),
    credits: profile?.credits || 0,
    totalImages: images.length,
  };

  const stats = [
    {
      label: "Remaining Credits",
      value: user.credits,
      icon: Sparkles,
      gradient: "from-primary to-accent",
    },
    {
      label: "Total Images Generated",
      value: user.totalImages,
      icon: Image,
      gradient: "from-accent to-primary",
    },
    {
      label: "Member Since",
      value: user.joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      icon: Calendar,
      gradient: "from-primary to-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="shadow-medium">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={user.profilePicture} alt={user.name} />
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <AvatarPicker 
                    currentAvatar={user.profilePicture}
                    userName={user.name}
                    onAvatarChange={(newAvatar) => {
                      setProfile(prev => prev ? { ...prev, avatar_url: newAvatar } : null);
                    }}
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    Pro Member
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Image History */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Image History</CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No images generated yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_data}
                        alt={image.prompt}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-3 flex flex-col justify-between">
                        <p className="text-white text-sm line-clamp-3">{image.prompt}</p>
                        <div className="flex items-center justify-between text-white text-xs">
                          <span>{new Date(image.created_at).toLocaleDateString()}</span>
                          {image.liked && <Heart className="w-4 h-4 fill-current" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
