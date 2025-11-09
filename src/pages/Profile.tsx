import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Image } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Mock user data - in a real app, this would come from your database
  const user = {
    name: session?.user?.user_metadata?.name || "User",
    email: session?.user?.email || "",
    profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email}`,
    joinedDate: session?.user?.created_at ? new Date(session.user.created_at) : new Date(),
    credits: 150,
    totalImages: 47,
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
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={user.profilePicture} alt={user.name} />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
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

          {/* Additional Info */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className="font-medium text-primary">Active</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Plan</p>
                  <p className="font-medium">Pro Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
