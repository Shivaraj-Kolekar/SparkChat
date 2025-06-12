"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Check, Save } from "lucide-react";
import Header from "@/components/header";

export default function Settings() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isSaving, setIsSaving] = useState(false);

  // Model Settings
  const [defaultModel, setDefaultModel] = useState("gemini");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);

  // Chat Settings
  const [autoSave, setAutoSave] = useState(true);
  const [streamMessages, setStreamMessages] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);

  // Appearance Settings
  const [fontSize, setFontSize] = useState("16");
  const [enableMarkdown, setEnableMarkdown] = useState(true);
  const [bubbleStyle, setBubbleStyle] = useState("modern");

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
    // Load saved settings here
    // loadSettings();
  }, [session, isPending]);

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

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container  flex flex-col px-40 py-10">
      <Header></Header>
      <div className="flex   justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your chat preferences and configurations
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Model Settings */}
        <div className="flex justify-center items-center space-y-1 flex-col">
          <h1 className="text-4xl text-center font-semibold">
            {session?.user.name}
          </h1>
          <h2 className="text-lg font-normal text-center">
            {session?.user.email}
          </h2>
          <Button
            variant={"destructive"}
            className="w-fit"
            onClick={() => {
              authClient.signOut;
            }}
          >
            Logout
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Model Settings</CardTitle>
            <CardDescription>
              Configure your AI model preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Model</Label>
              <Select value={defaultModel} onValueChange={setDefaultModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="ollama">Ollama</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Temperature ({temperature})</Label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chat Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Settings</CardTitle>
            <CardDescription>Customize your chat experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save chat history
                </p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Stream Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Show messages as they are being generated
                </p>
              </div>
              <Switch
                checked={streamMessages}
                onCheckedChange={setStreamMessages}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Web Search</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to search the web for current information
                </p>
              </div>
              <Switch
                checked={enableSearch}
                onCheckedChange={setEnableSearch}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">Small</SelectItem>
                  <SelectItem value="16">Medium</SelectItem>
                  <SelectItem value="18">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Markdown Support</Label>
                <p className="text-sm text-muted-foreground">
                  Enable markdown formatting in messages
                </p>
              </div>
              <Switch
                checked={enableMarkdown}
                onCheckedChange={setEnableMarkdown}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Chat Bubble Style</Label>
              <Select value={bubbleStyle} onValueChange={setBubbleStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
