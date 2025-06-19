"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Bolt,
  Brain,
  Check,
  CloudLightning,
  Eye,
  File,
  FileText,
  Globe,
  Languages,
  Save,
  Text,
  Zap,
  Mail,
  Github,
  Linkedin,
  Code,
  User,
} from "lucide-react";
import Header from "@/components/header";
import { Textarea } from "@/components/ui/textarea";
import { register } from "module";
import { z } from "zod";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import { api, getClerkToken } from "@/lib/api-client";

// Create form schema

export default function Settings() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [existingPreferences, setExistingPreferences] = useState<any>(null);
  const userFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(30),
    profession: z.string().min(2).max(100),
    traits: z.string().max(50),
    description: z.string().max(3000),
  });
  const { fieldContext, formContext } = createFormHookContexts();
  const { useAppForm } = createFormHook({
    fieldComponents: {
      Input,
      Textarea,
    },
    formComponents: {
      Button,
    },
    fieldContext,
    formContext,
  });

  // Fetch existing preferences
  const fetchPreferences = async () => {
    try {
      setIsLoadingPreferences(true);
      const response = await api.get("/api/preferences");

      if (response.data.success && response.data.data) {
        setExistingPreferences(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to view preferences");
      } else {
        toast.error("Failed to load preferences");
      }
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // Create form using schema with default values from existing preferences
  const form = useAppForm({
    defaultValues: {
      name: existingPreferences?.name || "",
      profession: existingPreferences?.profession || "",
      traits: existingPreferences?.traits || "",
      description: existingPreferences?.user_description || "",
    },
    validators: {
      onChange: userFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSaving(true);
        const response = await api.post("/api/preferences", {
          name: value.name,
          profession: value.profession,
          traits: value.traits,
          description: value.description,
        });

        if (response.data.success) {
          toast.success(
            response.data.message || "Profile updated successfully"
          );
          // Refresh preferences after update
          await fetchPreferences();
        }
      } catch (error: any) {
        console.error(error);
        if (error.response?.status === 401) {
          toast.error("Please login to update preferences");
        } else if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("An error occurred while updating preferences");
        }
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Fetch preferences when component mounts
  useEffect(() => {
    if (user && isLoaded) {
      fetchPreferences();
    }
  }, [user, isLoaded]);

  // Update form values when preferences are loaded
  useEffect(() => {
    if (existingPreferences) {
      form.setFieldValue("name", existingPreferences.name || "");
      form.setFieldValue("profession", existingPreferences.profession || "");
      form.setFieldValue("traits", existingPreferences.traits || "");
      form.setFieldValue(
        "description",
        existingPreferences.user_description || ""
      );
    }
  }, [existingPreferences, form]);

  interface UseCaseDetails {
    icon: JSX.Element; // Or React.ReactNode if it can be other things
    color: string; // Tailwind CSS classes will be strings
  }
  // Model Settings
  const [defaultModel, setDefaultModel] = useState("gemini");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);

  // Chat Settings
  const [autoSave, setAutoSave] = useState(true);
  const [streamMessages, setStreamMessages] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);
  const handleDeleteAccount = async (id: string) => {
    try {
      await api.delete(`/api/account/${id}`);

      toast.success("Account Deleted");
      router.push("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error deleting account");
    }
  };
  // Appearance Settings
  const [fontSize, setFontSize] = useState("16");
  const [enableMarkdown, setEnableMarkdown] = useState(true);
  const [bubbleStyle, setBubbleStyle] = useState("modern");
  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [traits, settraits] = useState("");
  const [profession, setprofession] = useState("");
  const [remaining, setRemaining] = useState<number>(10);
  const [resetAt, setResetAt] = useState<string>("");
  const [loadingUsage, setLoadingUsage] = useState<boolean>(true);
  const models = [
    {
      label: "Llama 4 Scout",
      value: "meta-llama/llama-4-scout-17b-16e-instruct",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
      description:
        "Llama 4 Scout is a versatile multimodal model from Meta, capable of understanding and generating content from text and images. It excels in tasks requiring both visual and textual comprehension, and supports a wide range of languages, making it ideal for diverse global applications.",
      usecase: ["Vision", "Text", "Multilingual"],
    },

    {
      value: "llama3-8b-8192",
      label: "Llama 3",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
      description:
        "Llama 3 is a powerful text-based large language model by Meta. It is designed for generating high-quality text, engaging in natural conversations, and performing various language understanding tasks. Its multilingual capabilities make it suitable for global applications requiring sophisticated text processing.",
      usecase: ["Text", "Multilingual"],
    },
    {
      value: "llama-3.1-8b-instant",
      label: "Llama 3.1",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
      description:
        "Llama 3.1 is an advanced iteration of Meta's Llama series, primarily focused on refined text generation and improved multilingual support. It offers enhanced conversational abilities and is optimized for complex language tasks, providing more nuanced and contextually aware responses.",
      usecase: ["Text", "Multilingual"],
    },
    {
      value: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
      description:
        "Gemini 2.0 Flash is a high-performance multimodal model from Google. It excels in processing and understanding both text and visual information, including insights from PDFs, and integrates robust search capabilities for comprehensive data retrieval and analysis.",
      usecase: ["Text", "Vision", "PDFs", "Search"],
    },

    {
      value: "gemini-2.0-flash-lite",
      label: "Gemini 2.0 Flash Lite",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
      description:
        "Gemini 2.0 Flash Lite is a streamlined and faster version of Gemini 2.0 Flash. It's optimized for quick responses and efficient processing of text, images, and PDFs, making it perfect for applications where speed and responsiveness are critical.",
      usecase: ["Fast", "Text", "Vision", "PDFs"],
    },
    {
      value: "gemini-2.5-flash-preview-04-17",
      label: "Gemini 2.5 Flash",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
      description:
        "Gemini 2.5 Flash, a cutting-edge model from Google, offers advanced multimodal capabilities, seamlessly handling text, vision, and PDF content. It features enhanced search integration for superior information access and is designed for complex, data-rich applications.",
      usecase: ["Text", "Vision", "PDFs", "Search"],
    },
    {
      value: "qwen-qwq-32b",
      label: "Qwen QwQ",
      svg: {
        path: "M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z",
        title: "Qwen",
        viewbox: "0 0 24 24 ",
      },
      description:
        "Qwen QwQ is a robust language model known for its strong reasoning abilities and efficient text processing. Developed for tasks requiring logical deduction and coherent text generation, it's particularly effective in scenarios demanding analytical insights and structured outputs.",
      usecase: ["Text", "Reasoning"],
    },
  ];
  // Somewhere accessible in your project, e.g., in a separate config file or directly in your component file
  const useCaseConfig: { [key: string]: UseCaseDetails } = {
    Text: {
      icon: <Text size={16} />,
      color: "bg-blue-100 text-blue-800", // Tailwind CSS classes
    },
    Vision: {
      icon: <Eye size={16}></Eye>,
      color: "bg-green-100 text-green-800",
    },
    Multilingual: {
      icon: <Languages size={16} />,
      color: "bg-purple-100 text-purple-800",
    },
    PDFs: {
      icon: <FileText size={16} />,
      color: "bg-red-100 text-red-800",
    },
    Search: {
      icon: <Globe size={16} />,
      color: "bg-yellow-100 text-yellow-800",
    },
    Fast: {
      icon: <Zap size={16} />,
      color: "bg-orange-100 text-orange-800",
    },
    Reasoning: {
      icon: <Brain size={16} />,
      color: "bg-fuchsia-100  text-fuchsia-800 ",
    },
  };

  useEffect(() => {
    if (!user && !isLoaded) {
      router.push("/login");
    }
    // Load saved settings here
    // loadSettings();
  }, [user, isLoaded]);

  useEffect(() => {
    async function fetchUsage() {
      try {
        setLoadingUsage(true);
        const token = await getClerkToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai`,
          {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setRemaining(data.remaining);
          setResetAt(data.resetAt);
        }
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoadingUsage(false);
      }
    }
    fetchUsage();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save settings to backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated save
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user && !isLoaded) {
    return <div>Loading...</div>;
  }
  return (
    <div className=" justify-center flex flex-col px-4 py-8 md:px-12 md:py-10 lg:px-40 p-auto lg:py-10">
      <Header></Header>
      <div className="flex   justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your chat preferences and configurations
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5 space-y-6">
        {/* Model Settings */}
        <div className="flex min-w-[300] space-y-2 justify-start   items-center  flex-col">
          <Image
            className="rounded-full "
            src={user?.imageUrl ? user?.imageUrl : "/sparkchat.png"}
            alt="user-profile"
            width={180}
            height={180}
          />
          <h1 className="text-4xl text-center font-semibold">
            {user?.fullName || user?.username}
          </h1>
          <h2 className="text-lg font-normal text-center">
            {user?.primaryEmailAddress?.emailAddress}
          </h2>

          <Card className=" mt-6 shadow-lg w-full rounded-xl">
            <CardHeader>
              <CardTitle>
                <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span>Search</span>
                  <span>
                    <kbd className="dark:bg-slate-900  bg-slate-200 p-2 rounded-sm kbd-box">
                      Ctrl
                    </kbd>
                    <kbd className="dark:bg-slate-900  bg-slate-200 p-2 rounded-sm kbd-box ml-1">
                      K
                    </kbd>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Chat</span>
                  <span>
                    <kbd className="dark:bg-slate-900  bg-slate-200 p-2 rounded-sm kbd-box">
                      Ctrl
                    </kbd>
                    <kbd className="dark:bg-slate-900  bg-slate-200 p-2 rounded-sm kbd-box ml-1">
                      Shift
                    </kbd>
                    <kbd className="dark:bg-slate-900  bg-slate-200 p-2 rounded-sm kbd-box ml-1">
                      O
                    </kbd>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Toggle Sidebar</span>
                  <span>
                    <kbd className="dark:bg-slate-900  bg-slate-200 p-2 rounded-sm kbd-box">
                      Ctrl
                    </kbd>
                    <kbd className="dark:bg-slate-900  bg-slate-200 p-2 rounded-sm kbd-box ml-1">
                      B
                    </kbd>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="account" className="w-full">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="contact-us">Contact us</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            {/* <div className="mt-8 border bg-secondary rounded-lg p-6">
              <h2 className="text-lg font-semibold  mb-2">Danger Zone</h2>

              <Dialog>
                <DialogTrigger>
                  <Button
                    variant="destructive"
                    // onClick={() => handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure you want to Delete your account ?
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-destructive mb-4">
                    Deleting your account is irreversible. All your data will be
                    lost.
                  </p>
                  <DialogFooter className="space-x-1.5">
                    <DialogClose className="h-9 px-4 py-2 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50">
                      Cancel
                    </DialogClose>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        // Implement delete account logic using Clerk
                      }}
                    >
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div> */}
            {/* Message Usage Section */}
            <Card className="mt-6 shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">Message Usage</h2>
                </CardTitle>
                <CardDescription>
                  {loadingUsage
                    ? "Loading..."
                    : resetAt
                    ? `Resets at: ${new Date(resetAt).toLocaleString()}`
                    : null}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsage ? (
                  <div>Loading usage...</div>
                ) : (
                  <>
                    <div className="mb-2 flex justify-between">
                      <span>Standard</span>
                      <span>{10 - remaining}/10</span>
                    </div>
                    <div className="w-full h-2 bg-gray-300 rounded-full mb-2">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${((10 - remaining) / 10) * 100}%` }}
                      />
                    </div>
                    <div>{remaining} messages remaining</div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="customization">
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Customize SparkChat
                  {isLoadingPreferences && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label>Name</Label>
                    {isLoadingPreferences ? (
                      <Input
                        disabled
                        placeholder="Loading..."
                        className="opacity-50"
                      />
                    ) : (
                      <form.AppField
                        name="name"
                        children={(field) => (
                          <Input
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="What should we call you?"
                          />
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Profession</Label>
                    {isLoadingPreferences ? (
                      <Input
                        disabled
                        placeholder="Loading..."
                        className="opacity-50"
                      />
                    ) : (
                      <form.AppField
                        name="profession"
                        children={(field) => (
                          <Input
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="What do you do?"
                          />
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Traits</Label>
                    {isLoadingPreferences ? (
                      <Input
                        disabled
                        placeholder="Loading..."
                        className="opacity-50"
                      />
                    ) : (
                      <form.AppField
                        name="traits"
                        children={(field) => (
                          <Input
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Funny, concise, curious, etc"
                          />
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>User description</Label>
                    {isLoadingPreferences ? (
                      <Textarea
                        disabled
                        placeholder="Loading..."
                        className="h-32 opacity-50"
                      />
                    ) : (
                      <form.AppField
                        name="description"
                        children={(field) => (
                          <Textarea
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-32"
                            placeholder="Tell us more about yourself..."
                          />
                        )}
                      />
                    )}
                  </div>
                  <form.AppForm>
                    <form.Button
                      disabled={form.state.isSubmitting || isLoadingPreferences}
                      className="flex items-center gap-2"
                    >
                      {isLoadingPreferences ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Loading...
                        </>
                      ) : form.state.isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {existingPreferences ? "Updating..." : "Saving..."}
                        </>
                      ) : existingPreferences ? (
                        "Update Preferences"
                      ) : (
                        "Save Preferences"
                      )}
                    </form.Button>
                  </form.AppForm>
                </form>
              </CardContent>
            </Card>

            {/* Chat Settings */}
          </TabsContent>{" "}
          <TabsContent className="" value="models">
            <div className="mt-8 space-y-3">
              {models.map((model) => (
                <Card className="drop-shadow-sm">
                  <CardHeader className="inline-flex gap-3 items-center">
                    <svg
                      className="size-12 text-color-heading"
                      viewBox={model.svg.viewbox}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                    >
                      <title>{model.svg?.title}</title>
                      <path d={model.svg?.path}></path>
                    </svg>
                    <CardTitle>{model.label}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p>{model.description}</p>
                    <div className="space-x-2 my-3 inline-flex">
                      {model.usecase.map((usecase) => {
                        const config = useCaseConfig[usecase];
                        if (!config) return null; // Handle cases where a use case might not have a config

                        return (
                          <Badge
                            key={usecase}
                            className={`flex items-center gap-1 ${config.color}`}
                          >
                            {config.icon && (
                              <span className="h-4 w-4">{config.icon}</span>
                            )}
                            {usecase}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="contact-us">
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold mb-2">Contact Us</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Contact Links */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <a
                        href="mailto:shivkolekar01@gmail.com"
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        shivkolekar01@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Github className="h-5 w-5 text-primary" />
                      <a
                        href="https://github.com/Shivaraj-Kolekar"
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        github.com/Shivaraj-Kolekar
                      </a>
                    </div>
                  </div>
                  {/* Feedback Form */}
                  <div className="mt-6">
                    <h3 className="text-base font-semibold mb-2">
                      Send Feedback, Suggestions, or Report a Bug
                    </h3>
                    <form
                      action="mailto:shivkolekar01@gmail.com"
                      method="POST"
                      encType="text/plain"
                    >
                      <textarea
                        name="message"
                        rows={5}
                        placeholder="Type your feedback, suggestion, or bug report here..."
                        className="w-full rounded-lg border border-border bg-background p-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                        required
                      />
                      <Button type="submit" className="w-full">
                        Send to Email
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
