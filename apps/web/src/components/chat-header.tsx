'use client';
import React, { useState, useEffect } from 'react';
import { useSidebar } from './ui/sidebar';
import { Badge } from './ui/badge';
import {  Brain, ChevronsUpDown, Diamond, Eye, FileText, Globe, Languages, PanelLeftIcon, Settings2, Text, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useModelStore } from '@/store/modelStore';
import type { JSX } from 'react/jsx-runtime';
import { getClerkToken } from '@/lib/api-client';

export default function ChatHeader(){
  const {toggleSidebar, state, isMobile}=useSidebar()
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState<number>(10);
  const [resetAt, setResetAt] = useState<string>("");
  const [loadingUsage, setLoadingUsage] = useState<boolean>(true);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const setSelectedModel = useModelStore((state) => state.setSelectedModel);
  const [value, setValue] = useState(selectedModel || "");
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
  // Sync local value with store selectedModel
  useEffect(() => {
    setValue(selectedModel || "");
  }, [selectedModel]);

  interface UseCaseDetails {
    icon: JSX.Element; // Or React.ReactNode if it can be other things
    color: string; // Tailwind CSS classes will be strings
    tooltip: string; // tooltip content as strings
  }

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
      icon: <Text size={4} />,
      tooltip: "Supports text generation",
      color: "bg-blue-200 text-blue-800 ", // Tailwind CSS classes
    },
    Vision: {
      icon: <Eye size={8}></Eye>,
      tooltip: "Supports image uploads and analysis",
      color: "bg-green-100 text-green-800",
    },
    Multilingual: {
      icon: <Languages size={8} />,
      tooltip: "Supports multiple languages",
      color: "bg-purple-100 text-purple-800",
    },
    PDFs: {
      icon: <FileText size={8} />,
      tooltip: "Supports PDFs upload and analysis",
      color: "bg-red-100 text-red-800",
    },
    Search: {
      icon: <Globe size={4} />,
      tooltip: "Supports Web Search to answer questions",
      color: "bg-yellow-100 text-yellow-800",
    },
    Fast: {
      icon: <Zap size={4} />,
      tooltip: "Very fast model",
      color: "bg-orange-100 text-orange-800",
    },
    Reasoning: {
      icon: <Brain size={4} />,
      tooltip: "Supports Reasoning capabilities",
      color: "bg-fuchsia-100  text-fuchsia-800 ",
    },
  };
  return (
    <div className="flex h-13 flex-row">
     <div className={cn(
       "h-13 fixed flex justify-between items-center bg-background z-50 border-b transition-all duration-300 overflow-hidden",
       // Desktop: adjust for sidebar, Mobile: always full width
       !isMobile && state === "expanded" ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full"
     )}>
      <header className="bg-background z-10 align-middle items-center flex h-auto py-2 my-2 shrink-0 gap-2 px-2 sm:px-4 min-w-0 flex-1">
         <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
           <Button
             data-sidebar="trigger"
             data-slot="sidebar-trigger"
             variant="outline"
             size="sm"
             className={cn("shrink-0")}
             onClick={(e) => {
               e.preventDefault();
               toggleSidebar();
             }}
           >
             <PanelLeftIcon className="h-4 w-4" />
             <span className="sr-only">Toggle Sidebar</span>
           </Button>
           <Popover open={open} onOpenChange={setOpen}>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 role="combobox"
                 aria-expanded={open}
                 className={cn(
                   "justify-between min-w-0 flex-1 text-xs sm:text-sm",
                   isMobile ? "max-w-[160px]" : "w-[200px] max-w-[200px]"
                 )}
               >
                 {selectedModel
                   ? models.find((model) => model.value === selectedModel)
                       ?.label
                   : "Select Model"}
                 <ChevronsUpDown className="opacity-50" />
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-[400px]  p-0">
               <Command>
                 <CommandInput
                   placeholder="Search model..."
                   className="h-9"
                 />
                 <CommandList>
                   <CommandEmpty>No Models found.</CommandEmpty>
                   <CommandGroup>
                     {models.map((model) => (
                       <CommandItem
                         key={model.value}
                         value={model.value}
                         className={cn(
                           "ml-auto",
                           "flex flex-row justify-between items-center",
                           selectedModel === model.value
                             ? "bg-accent"
                             : "bg-none"
                         )}
                         onSelect={(currentValue) => {
                           setValue(currentValue);
                           setOpen(false);
                           setSelectedModel(currentValue);
                         }}
                       >
                         <div className="inline-flex gap-2 items-center">
                           <svg
                             className="size-4 text-color-heading"
                             viewBox={model.svg.viewbox}
                             xmlns="http://www.w3.org/2000/svg"
                             fill="currentColor"
                           >
                             <title>{model.svg?.title}</title>
                             <path d={model.svg?.path}></path>
                           </svg>
                           <p className="text-base">{model.label}</p>{" "}
                         </div>
                         <div className="space-x-2 my-1.5 inline-flex">
                           {model.usecase.map((usecase) => {
                             const config = useCaseConfig[usecase];
                             if (!config) return null;
                             return (
                               <Tooltip key={usecase}>
                                 <TooltipTrigger>
                                   <Badge
                                     className={`flex items-center rounded-sm p-1 gap-1 ${config.color}`}
                                   >
                                     {config.icon && (
                                       <span className="h-4 rounded-none w-4">
                                         {config.icon}
                                       </span>
                                     )}
                                   </Badge>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   {config.tooltip}
                                 </TooltipContent>
                               </Tooltip>
                             );
                           })}
                         </div>
                       </CommandItem>
                     ))}
                   </CommandGroup>
                 </CommandList>
               </Command>
             </PopoverContent>
           </Popover>
         </div>

       </header>
       <div className="flex flex-row gap-1 sm:gap-2 items-center px-2 sm:px-4 shrink-0">
         <Tooltip>

         <TooltipTrigger><Link href="/settings">
                    <Button variant={"outline"} size="icon" className="shrink-0">
                      <Settings2 className="h-4 w-4" />
                      {/*<span className="ml-2 hidden lg:inline">Settings</span>*/}
                    </Button>
                  </Link></TooltipTrigger><TooltipContent>Settings</TooltipContent></Tooltip>
                  <div className="shrink-0">
                    <ModeToggle />
                  </div>
                  <div>
            <Tooltip>

            <TooltipTrigger>

            <Badge  className='size-9 w-12'><Diamond className=''></Diamond> { remaining}</Badge>            </TooltipTrigger>

            <TooltipContent>
              {remaining > 0 ? 'You have ' + remaining + ' credits left' : 'You have no credits left'}
            </TooltipContent>
</Tooltip>
                  </div>
                </div>
     </div>
   </div>
  )
}
