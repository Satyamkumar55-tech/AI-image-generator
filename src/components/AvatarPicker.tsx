import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvatarPickerProps {
  currentAvatar: string;
  userName: string;
  onAvatarChange: (newAvatar: string) => void;
}

const avatarStyles = [
  { name: "Avataaars", style: "avataaars" },
  { name: "Bottts", style: "bottts" },
  { name: "Pixel Art", style: "pixel-art" },
  { name: "Initials", style: "initials" },
  { name: "Fun Emoji", style: "fun-emoji" },
  { name: "Big Smile", style: "big-smile" },
  { name: "Adventurer", style: "adventurer" },
  { name: "Lorelei", style: "lorelei" },
];

export const AvatarPicker = ({ currentAvatar, userName, onAvatarChange }: AvatarPickerProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateAvatarUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not found");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: selectedAvatar })
        .eq('id', user.id);

      if (error) throw error;

      onAvatarChange(selectedAvatar);
      toast.success("Profile picture updated!");
      setOpen(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full h-10 w-10 border-4 border-background shadow-lg"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select an avatar style that represents you best
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {avatarStyles.map((avatar) => {
            const avatarUrl = generateAvatarUrl(avatar.style, userName);
            const isSelected = selectedAvatar === avatarUrl;
            
            return (
              <div key={avatar.style} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`relative rounded-full p-1 transition-all ${
                    isSelected
                      ? "ring-4 ring-primary shadow-lg scale-110"
                      : "hover:scale-105 hover:ring-2 hover:ring-primary/50"
                  }`}
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl} alt={avatar.name} />
                    <AvatarFallback>{userName[0]}</AvatarFallback>
                  </Avatar>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
                <span className="text-xs text-center text-muted-foreground">
                  {avatar.name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
