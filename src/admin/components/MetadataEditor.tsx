import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrayEditor } from "./ArrayEditor";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { useState } from "react";

interface MetadataData {
  overview: string;
  timeComplexity: string;
  spaceComplexity: string;
  companyTags: string[];
  visualizationUrl: string;
  leetcodeUrl?: string;
  likes?: number;
  dislikes?: number;
  unordered?: boolean;
  multi_expected?: boolean;
  is_pro?: boolean;
  class_mode?: boolean;
  class_name?: string;
}

interface MetadataEditorProps {
  data: MetadataData;
  onChange: (data: MetadataData) => void;
}

export function MetadataEditor({ data, onChange }: MetadataEditorProps) {
  const [tagInput, setTagInput] = useState("");

  const updateField = <K extends keyof MetadataData>(
    field: K,
    value: MetadataData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const addTag = () => {
    if (tagInput.trim() && !data.companyTags.includes(tagInput.trim())) {
      updateField("companyTags", [...data.companyTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    updateField(
      "companyTags",
      data.companyTags.filter((t) => t !== tag)
    );
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.overview}
            onChange={(e) => updateField("overview", e.target.value)}
            placeholder="High-level overview of the algorithm..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Test Comparison & Execution Options */}
      <Card>
        <CardHeader>
          <CardTitle>Execution & Comparison Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="unordered-toggle" className="font-semibold">Unordered Comparison</Label>
                <Switch
                  id="unordered-toggle"
                  checked={data.unordered || false}
                  onCheckedChange={(val) => updateField("unordered", val)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                If enabled, array results will be sorted before comparison. Useful for problems like "Find All Subsets" where order doesn't matter.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="multi-expected-toggle" className="font-semibold">Multiple Valid Outputs</Label>
                <Switch
                  id="multi-expected-toggle"
                  checked={data.multi_expected || false}
                  onCheckedChange={(val) => updateField("multi_expected", val)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                If enabled, "expectedOutput" should be an array of valid results. Code passes if actual matches ANY variant.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="class-mode-toggle" className="text-base font-semibold">Class-Based Execution (Multi-Function)</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this for problems like LRU Cache that require a sequence of method calls on a class instance.
                  </p>
                </div>
                <Switch
                  id="class-mode-toggle"
                  checked={data.class_mode || false}
                  onCheckedChange={(val) => updateField("class_mode", val)}
                />
              </div>
              
              {data.class_mode && (
                <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="class-name-input">Class Name (Optional)</Label>
                  <Input
                    id="class-name-input"
                    value={data.class_name || ""}
                    onChange={(e) => updateField("class_name", e.target.value)}
                    placeholder="e.g., LRUCache (auto-detected if empty)"
                  />
                  <p className="text-xs text-muted-foreground">
                    The name of the class to instantiate. If left blank, it will be auto-detected from the first element of the test case method array.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Pro Content Toggle */}
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
            Premium Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="pro-toggle" className="text-base font-semibold text-orange-800 dark:text-orange-300">
                Mark as Pro Problem
              </Label>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
                Pro problems restrict Solutions, Visualizations, and Scratchpad for non-subscribers.
              </p>
            </div>
            <Switch
              id="pro-toggle"
              checked={data.is_pro || false}
              onCheckedChange={(val) => updateField("is_pro", val)}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Complexity */}
      <Card>
        <CardHeader>
          <CardTitle>Complexity Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Time Complexity</Label>
            <Input
              value={data.timeComplexity}
              onChange={(e) => updateField("timeComplexity", e.target.value)}
              placeholder="e.g., O(n log n)"
            />
          </div>
          <div className="space-y-2">
            <Label>Space Complexity</Label>
            <Input
              value={data.spaceComplexity}
              onChange={(e) => updateField("spaceComplexity", e.target.value)}
              placeholder="e.g., O(n)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Company Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Add a company (e.g., Google, Amazon)"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {data.companyTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.companyTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-2 px-3 py-1.5">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {data.companyTags.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No company tags added yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Visualization URL */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Visualization URL</Label>
            <Input
              value={data.visualizationUrl}
              onChange={(e) => updateField("visualizationUrl", e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Link to an external visualization or demo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LeetCode URL */}
      <Card>
        <CardHeader>
          <CardTitle>LeetCode Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>LeetCode Problem URL</Label>
            <Input
              value={data.leetcodeUrl || ""}
              onChange={(e) => updateField("leetcodeUrl", e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Link to the corresponding LeetCode problem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Likes</Label>
            <Input
              type="number"
              value={data.likes || 0}
              onChange={(e) =>
                updateField("likes", parseInt(e.target.value) || 0)
              }
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Dislikes</Label>
            <Input
              type="number"
              value={data.dislikes || 0}
              onChange={(e) =>
                updateField("dislikes", parseInt(e.target.value) || 0)
              }
              min="0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
