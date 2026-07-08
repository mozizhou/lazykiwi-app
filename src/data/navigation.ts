import {
  Camera,
  Edit,
  Film,
  ImageIcon,
  MessageSquare,
  Scissors,
  Smile,
  UserSquare,
  Users,
  Video,
  Wand2
} from "lucide-react";
import { appUrl } from "@/lib/routes";

export const appNavigation = [
  {
    category: "Generator",
    items: [
      { title: "Video Generator", href: "/app/video-generator", icon: Video },
      { title: "Image Generator", href: "/app/image-generator", icon: ImageIcon }
    ]
  },
  {
    category: "Apps",
    items: [{ title: "Avatar Talking", href: "/app/avatar-talking", icon: UserSquare }]
  },
  {
    category: "Effects",
    items: [
      { title: "Photo Effects", href: "/app/photo-effects", icon: Camera },
      { title: "Video Effects", href: "/app/video-effects", icon: Wand2 },
      { title: "Face Swap", href: "/app/face-swap", icon: Users },
      { title: "Character Swap", href: "/app/character-swap", icon: Smile },
      { title: "Meme Generator", href: "/app/meme-generator", icon: MessageSquare }
    ]
  },
  {
    category: "Tools",
    items: [
      { title: "Background Remover", href: "/app/background-remover", icon: Scissors },
      { title: "Image Editor", href: "/app/image-editor", icon: Edit },
      { title: "Video Editor", href: "/app/video-editor", icon: Film }
    ]
  }
];

export const landingCards = [
  {
    title: "GPT Image 2",
    description: "Create production-ready images with prompt, reference, aspect ratio, and quality controls.",
    href: appUrl("/app/image-generator"),
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/01-gpt-image-2.png"
  },
  {
    title: "Video Effects",
    description: "Turn clips and images into high-impact motion templates for social content.",
    href: appUrl("/app/video-effects"),
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/02-video-effects.png"
  },
  {
    title: "Camera Motion",
    description: "Reusable camera moves for cinematic transitions, zooms, and action scenes.",
    href: "/effects/bullet-time",
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/03-camera-motion.png"
  },
  {
    title: "Meme Generator",
    description: "Fast meme presets with upload, prompt, and one-click regeneration flows.",
    href: appUrl("/app/meme-generator"),
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/04-meme-generator.png"
  }
];
