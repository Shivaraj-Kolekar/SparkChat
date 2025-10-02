"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, type JSX } from "react";
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
import { X } from "lucide-react";
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
  Sun,
  Moon,
} from "lucide-react";
import Header from "@/components/header";
import type Theme from "next-themes";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { handleClientScriptLoad } from "next/script";
import { useThemeStore } from "@/store/themeStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

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

      // Parse traits into tags
      if (existingPreferences.traits) {
        const parsedTraits = existingPreferences.traits.split(',').map((trait: string) => trait.trim()).filter(Boolean);
        setTraitTags(parsedTraits);
      }
    }
  }, [existingPreferences, form]);

  // Handle trait management
  const addTraitTag = () => {
    const trimmedTrait = traitInput.trim();
    if (trimmedTrait && !traitTags.includes(trimmedTrait) && traitTags.length < maxTraits && trimmedTrait.length <= maxTraitLength) {
      const newTags = [...traitTags, trimmedTrait];
      setTraitTags(newTags);
      setTraitInput("");
      // Update form value
      form.setFieldValue("traits", newTags.join(", "));
    }
  };

  const removeTraitTag = (tagToRemove: string) => {
    const newTags = traitTags.filter(tag => tag !== tagToRemove);
    setTraitTags(newTags);
    // Update form value
    form.setFieldValue("traits", newTags.join(", "));
  };

  const handleTraitKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTraitTag();
    }
  };

  interface UseCaseDetails {
    icon: JSX.Element; // Or React.ReactNode if it can be other things
    color: string; // Tailwind CSS classes will be strings
  }
  // Model Settings
  const [defaultModel, setDefaultModel] = useState("gemini");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  // const [mode, setMode] = useState("light");
  // Chat Settings
  const [autoSave, setAutoSave] = useState(true);
  const [streamMessages, setStreamMessages] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);
  const handleDeleteAccount = async (id: string) => {
    try {
      await api.delete(`/api/account/${id}`);

      toast.success("Account Deleted");
      router.push("https://accounts.sparkchat.shivraj-kolekar.in/sign-up");
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

  // Traits management
  const [traitTags, setTraitTags] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState("");
  const maxTraits = 10;
  const maxTraitLength = 50;

  // Chat Management states
  const [chatList, setChatList] = useState<any[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isDeletingChats, setIsDeletingChats] = useState(false);

  // Feedback form states
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const models = [
    {
      value: "openai/gpt-oss-120b",
      label: "GPT-OSS 120B",
      svg: {
        path: "M304.246 295.411V249.828C304.246 245.989 305.687 243.109 309.044 241.191L400.692 188.412C413.167 181.215 428.042 177.858 443.394 177.858C500.971 177.858 537.44 222.482 537.44 269.982C537.44 273.34 537.44 277.179 536.959 281.018L441.954 225.358C436.197 222 430.437 222 424.68 225.358L304.246 295.411ZM518.245 472.945V364.024C518.245 357.304 515.364 352.507 509.608 349.149L389.174 279.096L428.519 256.543C431.877 254.626 434.757 254.626 438.115 256.543L529.762 309.323C556.154 324.679 573.905 357.304 573.905 388.971C573.905 425.436 552.315 459.024 518.245 472.941V472.945ZM275.937 376.982L236.592 353.952C233.235 352.034 231.794 349.154 231.794 345.315V239.756C231.794 188.416 271.139 149.548 324.4 149.548C344.555 149.548 363.264 156.268 379.102 168.262L284.578 222.964C278.822 226.321 275.942 231.119 275.942 237.838V376.986L275.937 376.982ZM360.626 425.922L304.246 394.255V327.083L360.626 295.416L417.002 327.083V394.255L360.626 425.922ZM396.852 571.789C376.698 571.789 357.989 565.07 342.151 553.075L436.674 498.374C442.431 495.017 445.311 490.219 445.311 483.499V344.352L485.138 367.382C488.495 369.299 489.936 372.179 489.936 376.018V481.577C489.936 532.917 450.109 571.785 396.852 571.785V571.789ZM283.134 464.79L191.486 412.01C165.094 396.654 147.343 364.029 147.343 332.362C147.343 295.416 169.415 262.309 203.48 248.393V357.791C203.48 364.51 206.361 369.308 212.117 372.665L332.074 442.237L292.729 464.79C289.372 466.707 286.491 466.707 283.134 464.79ZM277.859 543.48C223.639 543.48 183.813 502.695 183.813 452.314C183.813 448.475 184.294 444.636 184.771 440.797L279.295 495.498C285.051 498.856 290.812 498.856 296.568 495.498L417.002 425.927V471.509C417.002 475.349 415.562 478.229 412.204 480.146L320.557 532.926C308.081 540.122 293.206 543.48 277.854 543.48H277.859ZM396.852 600.576C454.911 600.576 503.37 559.313 514.41 504.612C568.149 490.696 602.696 440.315 602.696 388.976C602.696 355.387 588.303 322.762 562.392 299.25C564.791 289.173 566.231 279.096 566.231 269.024C566.231 200.411 510.571 149.067 446.274 149.067C433.322 149.067 420.846 150.984 408.37 155.305C386.775 134.192 357.026 120.758 324.4 120.758C266.342 120.758 217.883 162.02 206.843 216.721C153.104 230.637 118.557 281.018 118.557 332.357C118.557 365.946 132.95 398.571 158.861 422.083C156.462 432.16 155.022 442.237 155.022 452.309C155.022 520.922 210.682 572.266 274.978 572.266C287.931 572.266 300.407 570.349 312.883 566.028C334.473 587.141 364.222 600.576 396.852 600.576Z",
        title: "Open ai",
        viewbox: "118 120 480 480",
      },      credit: 1,

      description:
        "GPT-OSS 120B is a highly capable large language model from the Open Source Studio project. It is engineered for generating detailed text, understanding nuanced instructions, and facilitating natural conversations. With extensive multilingual support and advanced reasoning skills, GPT-OSS 120B is well-suited for demanding global applications that require sophisticated language processing.",
      usecase: ["Text", "Reasoning"],
    },
    {
      value: "openai/gpt-oss-20b",
      label: "GPT-OSS 20B",
      svg: {
        path: "M304.246 295.411V249.828C304.246 245.989 305.687 243.109 309.044 241.191L400.692 188.412C413.167 181.215 428.042 177.858 443.394 177.858C500.971 177.858 537.44 222.482 537.44 269.982C537.44 273.34 537.44 277.179 536.959 281.018L441.954 225.358C436.197 222 430.437 222 424.68 225.358L304.246 295.411ZM518.245 472.945V364.024C518.245 357.304 515.364 352.507 509.608 349.149L389.174 279.096L428.519 256.543C431.877 254.626 434.757 254.626 438.115 256.543L529.762 309.323C556.154 324.679 573.905 357.304 573.905 388.971C573.905 425.436 552.315 459.024 518.245 472.941V472.945ZM275.937 376.982L236.592 353.952C233.235 352.034 231.794 349.154 231.794 345.315V239.756C231.794 188.416 271.139 149.548 324.4 149.548C344.555 149.548 363.264 156.268 379.102 168.262L284.578 222.964C278.822 226.321 275.942 231.119 275.942 237.838V376.986L275.937 376.982ZM360.626 425.922L304.246 394.255V327.083L360.626 295.416L417.002 327.083V394.255L360.626 425.922ZM396.852 571.789C376.698 571.789 357.989 565.07 342.151 553.075L436.674 498.374C442.431 495.017 445.311 490.219 445.311 483.499V344.352L485.138 367.382C488.495 369.299 489.936 372.179 489.936 376.018V481.577C489.936 532.917 450.109 571.785 396.852 571.785V571.789ZM283.134 464.79L191.486 412.01C165.094 396.654 147.343 364.029 147.343 332.362C147.343 295.416 169.415 262.309 203.48 248.393V357.791C203.48 364.51 206.361 369.308 212.117 372.665L332.074 442.237L292.729 464.79C289.372 466.707 286.491 466.707 283.134 464.79ZM277.859 543.48C223.639 543.48 183.813 502.695 183.813 452.314C183.813 448.475 184.294 444.636 184.771 440.797L279.295 495.498C285.051 498.856 290.812 498.856 296.568 495.498L417.002 425.927V471.509C417.002 475.349 415.562 478.229 412.204 480.146L320.557 532.926C308.081 540.122 293.206 543.48 277.854 543.48H277.859ZM396.852 600.576C454.911 600.576 503.37 559.313 514.41 504.612C568.149 490.696 602.696 440.315 602.696 388.976C602.696 355.387 588.303 322.762 562.392 299.25C564.791 289.173 566.231 279.096 566.231 269.024C566.231 200.411 510.571 149.067 446.274 149.067C433.322 149.067 420.846 150.984 408.37 155.305C386.775 134.192 357.026 120.758 324.4 120.758C266.342 120.758 217.883 162.02 206.843 216.721C153.104 230.637 118.557 281.018 118.557 332.357C118.557 365.946 132.95 398.571 158.861 422.083C156.462 432.16 155.022 442.237 155.022 452.309C155.022 520.922 210.682 572.266 274.978 572.266C287.931 572.266 300.407 570.349 312.883 566.028C334.473 587.141 364.222 600.576 396.852 600.576Z",
        title: "Open ai",
        viewbox: "118 120 480 480",
      },
      description:
        "GPT-OSS 20B is a versatile large language model developed by Open Source Studio. It specializes in producing high-quality text, following user instructions, and engaging in interactive dialogue. Its multilingual capabilities and efficient performance make GPT-OSS 20B an excellent choice for a variety of tasks involving language understanding and communication across diverse domains.",
      usecase: ["Text", "Reasoning"],
    },
    {
      value: "qwen/qwen3-32b",
      label: "Qwen 3-32B",
      svg: {
        path: "M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z",
        title: "Qwen",
        viewbox: "0 0 24 24 ",
      },      credit: 1,

      description:
        "Qwen QwQ is a robust language model known for its strong reasoning abilities and efficient text processing. Developed for tasks requiring logical deduction and coherent text generation, it's particularly effective in scenarios demanding analytical insights and structured outputs.",
      usecase: ["Text", "Reasoning"],
    },
    {
      value: "deepseek-r1-distill-llama-70b",
      label: "Deepseek R1 Distill Llama 70B",
      svg: {
          path: "M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z",
          title: "DeepSeek",
          viewbox: "0 0 24 24"
      },      credit: 1,

      description:
        "A powerful language model excelling in reasoning and code generation, ideal for complex problem-solving and development tasks.",
      usecase: ["Text", "Reasoning"],
    },
    {
      value: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },      credit: 1,

      description:
        "Gemini 2.0 Flash is a high-performance multimodal model from Google. It excels in processing and understanding both text and visual information, including insights from PDFs, and integrates robust search capabilities for comprehensive data retrieval and analysis.",
      usecase: ["Text", "Vision", "PDFs", "Search"],
    },

    // {
    //   value: "gemini-2.0-flash-lite-001",
    //   label: "Gemini 2.0 Flash Lite",
    //   svg: {
    //     path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
    //     title: "Gemini",
    //     viewbox: "0 0 16 16",
    //   },      credit: 1,

    //   description:
    //     "Gemini 2.0 Flash Lite is a streamlined and faster version of Gemini 2.0 Flash. It's optimized for quick responses and efficient processing of text, images, and PDFs, making it perfect for applications where speed and responsiveness are critical.",
    //   usecase: ["Fast", "Text", "Vision", "PDFs"],
    // },

    {
      label: "Llama 4 Scout",
      value: "meta-llama/llama-4-scout-17b-16e-instruct",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
      credit: 1,
      description:
        "Llama 4 Scout is a versatile multimodal model from Meta, capable of understanding and generating content from text and images. It excels in tasks requiring both visual and textual comprehension, and supports a wide range of languages, making it ideal for diverse global applications.",
      usecase: ["Vision", "Text", "Multilingual"],
    },

    {
      value: "llama-3.1-8b-instant",
      label: "Llama 3.1",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },      credit: 1,

      description:
        "Llama 3.1 is an advanced iteration of Meta's Llama series, primarily focused on refined text generation and improved multilingual support. It offers enhanced conversational abilities and is optimized for complex language tasks, providing more nuanced and contextually aware responses.",
      usecase: ["Text", "Multilingual"],
    },
    // {
    //   value: "meta-llama/llama-guard-4-12b",
    //   label: "Llama guard 4 12b",
    //   svg: {
    //     path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
    //     title: "Meta",
    //     viewbox: "0 0 256 171 ",
    //   },      credit: 1,

    //   description:
    //     "A language model focused on safety and responsible AI use, designed to identify and mitigate potentially harmful content.",
    //   usecase: ["Text", "Multilingual"],
    // },
    {
      value: "moonshotai/kimi-k2-instruct-0905",
      label: "Kimi K2",
      svg: {
        path: "M1.052 16.916l9.539 2.552a21.007 21.007 0 00.06 2.033l5.956 1.593a11.997 11.997 0 01-5.586.865l-.18-.016-.044-.004-.084-.009-.094-.01a11.605 11.605 0 01-.157-.02l-.107-.014-.11-.016a11.962 11.962 0 01-.32-.051l-.042-.008-.075-.013-.107-.02-.07-.015-.093-.019-.075-.016-.095-.02-.097-.023-.094-.022-.068-.017-.088-.022-.09-.024-.095-.025-.082-.023-.109-.03-.062-.02-.084-.025-.093-.028-.105-.034-.058-.019-.08-.026-.09-.031-.066-.024a6.293 6.293 0 01-.044-.015l-.068-.025-.101-.037-.057-.022-.08-.03-.087-.035-.088-.035-.079-.032-.095-.04-.063-.028-.063-.027a5.655 5.655 0 01-.041-.018l-.066-.03-.103-.047-.052-.024-.096-.046-.062-.03-.084-.04-.086-.044-.093-.047-.052-.027-.103-.055-.057-.03-.058-.032a6.49 6.49 0 01-.046-.026l-.094-.053-.06-.034-.051-.03-.072-.041-.082-.05-.093-.056-.052-.032-.084-.053-.061-.039-.079-.05-.07-.047-.053-.035a7.785 7.785 0 01-.054-.036l-.044-.03-.044-.03a6.066 6.066 0 01-.04-.028l-.057-.04-.076-.054-.069-.05-.074-.054-.056-.042-.076-.057-.076-.059-.086-.067-.045-.035-.064-.052-.074-.06-.089-.073-.046-.039-.046-.039a7.516 7.516 0 01-.043-.037l-.045-.04-.061-.053-.07-.062-.068-.06-.062-.058-.067-.062-.053-.05-.088-.084a13.28 13.28 0 01-.099-.097l-.029-.028-.041-.042-.069-.07-.05-.051-.05-.053a6.457 6.457 0 01-.168-.179l-.08-.088-.062-.07-.071-.08-.042-.049-.053-.062-.058-.068-.046-.056a7.175 7.175 0 01-.027-.033l-.045-.055-.066-.082-.041-.052-.05-.064-.02-.025a11.99 11.99 0 01-1.44-2.402zm-1.02-5.794l11.353 3.037a20.468 20.468 0 00-.469 2.011l10.817 2.894a12.076 12.076 0 01-1.845 2.005L.657 15.923l-.016-.046-.035-.104a11.965 11.965 0 01-.050-.153l-.007-.023a11.896 11.896 0 01-.207-.741l-.03-.126-.018-.08-.021-.097-.018-.081-.018-.09-.017-.084-.018-.094c-.026-.141-.05-.283-.071-.426l-.017-.118-.011-.083-.013-.102a12.01 12.01 0 01-.019-.161l-.005-.047a12.12 12.12 0 01-.034-2.145zm1.593-5.15l11.948 3.196c-.368.605-.705 1.231-1.01 1.875l11.295 3.022c-.142.82-.368 1.612-.668 2.365l-11.55-3.09L.124 10.26l.015-.1.008-.049.01-.067.015-.087.018-.098c.026-.148.056-.295.088-.442l.028-.124.02-.085.024-.097c.022-.09.045-.18.07-.268l.028-.102.023-.083.03-.1.025-.082.03-.096.026-.082.031-.095a11.896 11.896 0 011.01-2.232zm4.442-4.4L17.352 4.59a20.77 20.77 0 00-1.688 1.721l7.823 2.093c.267.852.442 1.744.513 2.665L2.106 5.213l.045-.065.027-.04.04-.055.046-.065.055-.076.054-.072.064-.086.05-.065.057-.073.055-.07.06-.074.055-.069.065-.077.054-.066.066-.077.053-.06.072-.082.053-.06.067-.074.054-.058.073-.078.058-.06.063-.067.168-.17.1-.098.059-.056.076-.071a12.084 12.084 0 012.272-1.677zM12.017 0h.097l.082.001.069.001.054.002.068.002.046.001.076.003.047.002.06.003.054.002.087.005.105.007.144.011.088.007.044.004.077.008.082.008.047.005.102.012.05.006.108.014.081.01.042.006.065.01.207.032.07.012.065.011.14.026.092.018.11.022.046.01.075.016.041.01L14.7.3l.042.01.065.015.049.012.071.017.096.024.112.03.113.03.113.032.05.015.07.02.078.024.073.023.050.016.050.016.076.025.099.033.102.036.048.017.064.023.093.034.11.041.116.045.1.04.047.02.06.024.041.018.063.026.04.018.057.025.11.048.1.046.074.035.075.036.06.028.092.046.091.045.102.052.053.028.049.026.046.024.06.033.041.022.052.029.088.05.106.06.087.051.057.034.053.032.096.059.088.055.098.062.036.024.064.041.084.056.04.027.062.042.062.043.023.017c.054.037.108.075.161.114l.083.06.065.048.056.043.086.065.082.064.04.03.05.041.086.069.079.065.085.071c.712.6 1.353 1.283 1.909 2.031L7.222.994l.062-.027.065-.028.081-.034.086-.035c.113-.045.227-.09.341-.131l.096-.035.093-.033.084-.03.096-.031c.087-.03.176-.058.264-.085l.091-.027.086-.025.102-.03.085-.023.1-.026L9.04.37l.090-.023.091-.022.095-.022.090-.02.098-.021.091-.02.095-.018.092-.018.1-.018.091-.016.098-.017.092-.014.097-.015.092-.013.102-.013.091-.012.105-.012.090-.01.105-.01c.093-.01.186-.018.280-.024l.106-.008.090-.005.11-.006.093-.004.1-.004.097-.002.099-.002.197-.002z",
        title: "MoonshotAI",
        viewbox: "0 0 24 24",
      },      credit: 1,

      description:
        "Kimi K2 Instruct is an advanced large language model developed by Moonshot AI. It excels at generating coherent text, following complex instructions, and engaging in interactive conversations. With strong multilingual support and robust reasoning abilities, Kimi K2 Instruct is ideal for a wide range of applications that demand precise language understanding and effective communication.",
      usecase: ["Text", "Multilingual"],
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
      router.push("https://accounts.sparkchat.shivraj-kolekar.in/sign-up");
    }
    // Load saved settings here
    // loadSettings();
  }, [user, isLoaded]);
  // const { setTheme } = useTheme();
  // // Theme and mode state
  // const [themeState, setThemeState] = useState({
  //   mode: "light",
  //   theme: "light",
  // });

  // // Handler for mode (light/dark)
  // const handleModeChange = (mode: "light" | "dark") => {
  //   setThemeState((prev) => ({ ...prev, mode }));
  //   setTheme(mode);
  // };

  // // Handler for theme (custom themes)
  // const handleThemeChange = (theme: string) => {
  //   setThemeState((prev) => ({ ...prev, theme }));
  //   setTheme(theme);
  // };
  const { setTheme, systemTheme } = useTheme();
  const { baseTheme, mode, setBaseTheme, setMode } = useThemeStore();

  React.useEffect(() => {
    setTheme(`${baseTheme}-${mode}`);
  }, [baseTheme, mode, setTheme]);
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

  // Fetch chats for management
  const fetchChats = async () => {
    try {
      setIsLoadingChats(true);
      const response = await api.get("/api/chat");
      if (response.data.success) {
        setChatList(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Delete selected chats
  const handleDeleteChats = async () => {
    if (selectedChats.length === 0) {
      toast.error("Please select chats to delete");
      return;
    }

    try {
      setIsDeletingChats(true);

      // Delete each selected chat
      await Promise.all(
        selectedChats.map(chatId => api.delete(`/api/chat/${chatId}`))
      );

      toast.success(`${selectedChats.length} chat(s) deleted successfully`);
      setSelectedChats([]);
      await fetchChats(); // Refresh the list
    } catch (error) {
      console.error("Error deleting chats:", error);
      toast.error("Failed to delete chats");
    } finally {
      setIsDeletingChats(false);
    }
  };

  // Toggle chat selection
  const toggleChatSelection = (chatId: string) => {
    setSelectedChats(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  // Select/deselect all chats
  const toggleAllChats = () => {
    if (selectedChats.length === chatList.length) {
      setSelectedChats([]);
    } else {
      setSelectedChats(chatList.map(chat => chat.id));
    }
  };

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

  // Handle feedback submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackContent.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    try {
      setIsSubmittingFeedback(true);

      // Use the API client to submit feedback
      const response = await api.post("/api/feedback", {
        feedback: feedbackContent,
      });

      // API returns 201 status code on success
      if (response.status >= 200 && response.status < 300) {
        toast.success("Feedback submitted successfully! Thank you for your input.");
        setFeedbackContent("");
      } else {
        const errorMessage = response.data?.error || "An unexpected error occurred";
        toast.error(`Error: ${errorMessage}. Please try again.`);
      }
    } catch (error: any) {
      console.error("Error submitting feedback:", error);

      if (error.code === 'ERR_NETWORK') {
        toast.error("Unable to connect to server. Please check your connection.");
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to submit feedback. Please try again later.");
      }
    } finally {
      setIsSubmittingFeedback(false);
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
                    <kbd className="bg-accent p-2 rounded-sm kbd-box">Ctrl</kbd>
                    <kbd className="bg-accent p-2 rounded-sm kbd-box ml-1">
                      K
                    </kbd>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Chat</span>
                  <span>
                    <kbd className="bg-accent p-2 rounded-sm kbd-box">Ctrl</kbd>

                    <kbd className="bg-accent p-2 rounded-sm kbd-box ml-1">
                      O
                    </kbd>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Toggle Sidebar</span>
                  <span>
                    <kbd className="bg-accent p-2 rounded-sm kbd-box">Ctrl</kbd>
                    <kbd className="bg-accent p-2 rounded-sm kbd-box ml-1">
                      B
                    </kbd>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="customization">Personalize</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="chat-management">Chat Management</TabsTrigger>
            <TabsTrigger value="contact-us">Contact us</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
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
                    <Label className="flex items-center justify-between">
                      <span>What traits should  SparkChat have?</span>
                      <span className="text-xs text-muted-foreground">
                        {traitTags.length}/{maxTraits} traits
                      </span>
                    </Label>

                    {isLoadingPreferences ? (
                      <Input
                        disabled
                        placeholder="Loading..."
                        className="opacity-50"
                      />
                    ) : (
                      <div className="space-y-3">
                        {/* Traits Input */}
                        <div className="flex gap-2">
                          <Input
                            value={traitInput}
                            onChange={(e) => setTraitInput(e.target.value)}
                            onKeyDown={handleTraitKeyPress}
                            placeholder="Type a trait and press Enter or Tab..."
                            className="flex-1"
                            maxLength={maxTraitLength}
                            disabled={traitTags.length >= maxTraits}
                          />
                          <Button
                            type="button"
                            onClick={addTraitTag}
                            disabled={!traitInput.trim() || traitTags.includes(traitInput.trim()) || traitTags.length >= maxTraits}
                            variant="outline"
                            size="sm"
                            className="px-4"
                          >
                            +
                          </Button>
                        </div>

                        {/* Character counter for current input */}
                        {traitInput.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {traitInput.length}/{maxTraitLength} characters
                          </div>
                        )}

                        {/* Trait Tags Display */}
                        {traitTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30 min-h-[60px]">
                            {traitTags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-background border hover:bg-accent transition-colors"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTraitTag(tag)}
                                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Helper text */}
                        <p className="text-xs text-muted-foreground">
                          Add traits like "friendly", "witty", "concise", "curious", "empathetic", "creative", "patient" (up to {maxTraitLength} chars each)
                        </p>

                        {/* Hidden input for form submission */}
                        <form.AppField
                          name="traits"
                          children={(field) => (
                            <input
                              type="hidden"
                              value={field.state.value}
                            />
                          )}
                        />
                      </div>
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
          <TabsContent className="w-auto lg:w-[50%]" value="appearance">
            <div className="mt-8">
              <Card className="shadow-lg border-2 border-border/60">
                <CardHeader>
                  <CardTitle>
                    <h1 className="text-center text-2xl font-bold tracking-tight">
                      Appearance
                    </h1>
                  </CardTitle>
                  <p className="text-center text-muted-foreground text-sm mt-1">
                    Choose your preferred color mode and theme.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-8 mt-2">
                  {/* Color Mode Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-center">
                      Color Mode
                    </h2>
                    <div className="flex gap-4">
                      <Button
                        variant={mode === "light" ? "default" : "outline"}
                        className={`flex-1 py-8 flex flex-col items-center gap-2 rounded-xl border transition-all duration-200 ${
                          mode === "light"
                            ? "border-primary bg-primary/90 text-white shadow"
                            : "border-border bg-background hover:bg-accent"
                        }`}
                        onClick={() => setMode("light")}
                      >
                        <Sun className="w-6 h-6 mb-1" />
                        <span className="font-medium">Light</span>
                      </Button>
                      <Button
                        variant={mode === "dark" ? "default" : "outline"}
                        className={`flex-1 py-8 flex flex-col items-center gap-2 rounded-xl border transition-all duration-200 ${
                          mode === "dark"
                            ? "border-primary bg-primary/90 text-white shadow"
                            : "border-border bg-background hover:bg-accent"
                        }`}
                        onClick={() => setMode("dark")}
                      >
                        <Moon className="w-6 h-6 mb-1" />
                        <span className="font-medium">Dark</span>
                      </Button>
                    </div>
                  </div>
                  {/* Theme Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-center">
                      Theme
                    </h2>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full">
                        <Button
                          variant={"outline"}
                          className="w-full py-5 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
                        >
                          <span>
                            {baseTheme === "amethyst"
                              ? "Amethyst"
                              : baseTheme === "tangerine"
                              ? "Tangerine"
                              : baseTheme === "graphite"
                              ? "Graphite"
                              : baseTheme === "t3"
                              ? "T3 Chat"
                              : baseTheme === "vercel"
                              ? "Vercel"
                              : baseTheme === "claude"
                              ? "Claude"
                              : "Select Theme"}
                          </span>
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="px-4 py-2 min-w-[180px]">
                        <DropdownMenuItem
                          className={`rounded-lg px-3 py-2 mb-1 font-medium ${
                            baseTheme === "amethyst"
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                          onClick={() => setBaseTheme("amethyst")}
                        >
                          {mode === "light" ? (
                            <div className="flex gap-0.5">
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{
                                  backgroundColor: "rgb(138, 121, 171)",
                                }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{
                                  backgroundColor: "rgb(230, 165, 184)",
                                }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{
                                  backgroundColor: "rgb(223, 217, 236)",
                                }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{
                                  backgroundColor: "rgb(206, 201, 217)",
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(169,149,201)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(55,46,63)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(90,83,112)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(48,44,64)" }}
                              />
                            </div>
                          )}
                          Amethyst
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={`rounded-lg px-3 py-2 mb-1 font-medium ${
                            baseTheme === "tangerine"
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                          onClick={() => setBaseTheme("tangerine")}
                        >
                          {mode === "light" ? (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(224,93,56)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(214,228,240)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(243,244,246)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(220,223,226)" }}
                              />
                            </div>
                          ) : (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(224,93,56)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(42,54,86)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(42,48,62)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(61,67,84)" }}
                              />
                            </div>
                          )}
                          Tangerine
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={`rounded-lg px-3 py-2 mb-1 font-medium ${
                            baseTheme === "graphite"
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                          onClick={() => setBaseTheme("graphite")}
                        >
                          {mode === "light" ? (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(96,96,96)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(192,192,192)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(224,224,224)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(208,208,208)" }}
                              />
                            </div>
                          ) : (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(160,160,160)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(64,64,64)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(48,48,48)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(53,53,53)" }}
                              />
                            </div>
                          )}
                          Graphite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={`rounded-lg px-3 py-2 font-medium ${
                            baseTheme === "t3"
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                          onClick={() => setBaseTheme("t3")}
                        >
                          {mode === "light" ? (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(168,67,112)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(241,196,230)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(241,196,230)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(239,189,235)" }}
                              />
                            </div>
                          ) : (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(163,0,76)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(70,55,83)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(54,45,61)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(59,50,55)" }}
                              />
                            </div>
                          )}
                          T3 Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={`rounded-lg px-3 py-2 font-medium ${
                            baseTheme === "vercel"
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                          onClick={() => setBaseTheme("vercel")}
                        >
                          {mode === "light" ? (
                            <div className="flex gap-0.5">
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{ backgroundColor: "oklch(0 0 0)" }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{ backgroundColor: "oklch(0.94 0 0)" }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{ backgroundColor: "oklch(0.94 0 0)" }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{ backgroundColor: "oklch(0.92 0 0)" }}
                              />
                            </div>
                          ) : (
                            <div className="flex gap-0.5 mt-2">
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{ backgroundColor: "oklch(1 0 0)" }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{ backgroundColor: "oklch(0.32 0 0)" }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{ backgroundColor: "oklch(0.25 0 0)" }}
                              />
                              <div
                                className="h-3 w-3 rounded-sm border border-muted"
                                style={{ backgroundColor: "oklch(0.26 0 0)" }}
                              />
                            </div>
                          )}
                          Vercel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={`rounded-lg px-3 py-2 font-medium ${
                            baseTheme === "claude"
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                          onClick={() => setBaseTheme("claude")}
                        >
                          {mode === "light" ? (
                            <div className="flex gap-0.5">
                              <div className="h-3 w-3 rounded-sm border border-muted bg-[#d97757]" />
                              <div className="h-3 w-3 rounded-sm border border-muted bg-[#1a1915]" />
                              <div className="h-3 w-3 rounded-sm border border-muted bg-[#faf9f5]" />
                              <div className="h-3 w-3 rounded-sm border border-muted bg-[#3e3e38]" />
                            </div>
                          ) : (
                            <div className="flex gap-0.5 mt-2">
                              <div className="h-3 w-3 rounded-sm border border-muted bg-[#c96442]" />
                              <div className="h-3 w-3 rounded-sm border border-muted bg-[#e9e6dc]" />
                              <div className="h-3 w-3 rounded-sm border border-muted bg-[#e9e6dc]" />
                              <div className="h-3 w-3 rounded-sm border border-muted bg-[#dad9d4]" />
                            </div>
                          )}
                          Claude
                        </DropdownMenuItem>{" "}
                        <DropdownMenuItem
                          className={`rounded-lg px-3 py-2 mb-1 font-medium ${
                            baseTheme === "mono"
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                          onClick={() => setBaseTheme("mono")}
                        >
                          {mode === "light" ? (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(96,96,96)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(192,192,192)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(224,224,224)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(208,208,208)" }}
                              />
                            </div>
                          ) : (
                            <div className="flex gap-0.5">
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(160,160,160)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(64,64,64)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(48,48,48)" }}
                              />
                              <div
                                className="border-muted h-3 w-3 rounded-sm border"
                                style={{ backgroundColor: "rgb(53,53,53)" }}
                              />
                            </div>
                          )}
                          Mono
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent className="" value="models">
            <div className="mt-8  space-y-3">
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
                    <div className="space-x-2 my-3  inline-flex">
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
          <TabsContent value="chat-management">
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">Chat Management</h2>
                </CardTitle>
                <CardDescription>
                  Select and delete your chat conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Controls */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={fetchChats}
                        disabled={isLoadingChats}
                      >
                        {isLoadingChats ? "Loading..." : "Refresh Chats"}
                      </Button>

                      {chatList.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="select-all"
                            checked={selectedChats.length === chatList.length && chatList.length > 0}
                            onCheckedChange={toggleAllChats}
                          />
                          <Label htmlFor="select-all" className="text-sm">
                            Select All ({selectedChats.length}/{chatList.length})
                          </Label>
                        </div>
                      )}
                    </div>

                    {selectedChats.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected ({selectedChats.length})
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                          </DialogHeader>
                          <p>Are you sure you want to delete {selectedChats.length} chat(s)? This action cannot be undone.</p>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteChats}
                                disabled={isDeletingChats}
                              >
                                {isDeletingChats ? "Deleting..." : "Delete"}
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {/* Chat List */}
                  {isLoadingChats ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading chats...</p>
                    </div>
                  ) : chatList.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No chats found. Click "Refresh Chats" to load your conversations.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2">
                      {chatList.map((chat) => (
                        <div
                          key={chat.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            selectedChats.includes(chat.id)
                              ? 'bg-accent border-primary'
                              : 'bg-card hover:bg-accent'
                          }`}
                        >
                          <Checkbox
                            id={`chat-${chat.id}`}
                            checked={selectedChats.includes(chat.id)}
                            onCheckedChange={() => toggleChatSelection(chat.id)}
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{chat.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(chat.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          <Badge variant={chat.public ? "default" : "secondary"}>
                            {chat.public ? "Public" : "Private"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contact-us">
            <div className="mt-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Get in Touch</h1>
                <p className="text-muted-foreground">
                  We'd love to hear from you! Reach out with questions, feedback, or suggestions.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Email Card */}
                {/*<Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Email</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Send us a message directly
                        </p>
                        <a
                          href="mailto:shivkolekar01@gmail.com"
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          shivkolekar01@gmail.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>*/}

                {/* GitHub Card */}
                <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Github className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">GitHub</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          View source code & contribute
                        </p>
                        <a
                          href="https://github.com/Shivaraj-Kolekar"
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          @Shivaraj-Kolekar
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback Form */}
              <Card className="shadow-lg border-2">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">Send us your feedback</CardTitle>
                  <CardDescription>
                    Help us improve SparkChat by sharing your thoughts, suggestions, or reporting bugs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-12"
                      onClick={() => setFeedbackContent("💡 Suggestion: ")}
                      type="button"
                    >
                      <span className="text-lg">💡</span>
                      Suggestion
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-12"
                      onClick={() => setFeedbackContent("🐛 Bug Report: ")}
                      type="button"
                    >
                      <span className="text-lg">🐛</span>
                      Bug Report
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-12"
                      onClick={() => setFeedbackContent("❤️ Feedback: ")}
                      type="button"
                    >
                      <span className="text-lg">❤️</span>
                      Feedback
                    </Button>
                  </div>

                  <form
                    onSubmit={handleFeedbackSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message</Label>
                      <Textarea
                        id="message"
                        value={feedbackContent}
                        onChange={(e) => setFeedbackContent(e.target.value)}
                        rows={6}
                        placeholder="Tell us what's on your mind..."
                        className="resize-none focus:ring-2 focus:ring-primary/20"
                        required
                        maxLength={500}
                        disabled={isSubmittingFeedback}
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {feedbackContent.length}/5000 characters
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold"
                      disabled={isSubmittingFeedback || !feedbackContent.trim()}
                    >
                      {isSubmittingFeedback ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Feedback
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Additional Info */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      We typically respond within 24-48 hours. Your feedback helps make SparkChat better for everyone! 🚀
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
