import { useState, useRef } from "react";
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
import { Camera, Check, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateAvatarUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not found");
        return;
      }

      // Delete old avatar if it exists and is from storage
      if (currentAvatar.includes('supabase')) {
        const oldPath = currentAvatar.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setSelectedAvatar(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
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
            Select an avatar style or upload your own image
          </DialogDescription>
        </DialogHeader>
        
        {/* Upload Custom Image Section */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Custom Image"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            PNG, JPG up to 5MB
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or choose a style
            </span>
          </div>
        </div>

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
