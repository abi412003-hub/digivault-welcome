import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

const CreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Determine where to go back based on registration type
  const registrationType = location.state?.registrationType || 
    localStorage.getItem("registrationType") || "individual";

  const handleBack = () => {
    if (registrationType === "organization") {
      navigate("/organization-registration");
    } else {
      navigate("/individual-registration");
    }
  };

  const handleNext = () => {
    // Generate project object
    const newProject = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    // Get existing projects from localStorage
    const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    
    // Add new project to the list
    const updatedProjects = [...existingProjects, newProject];
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    
    // Set as current project
    localStorage.setItem("currentProject", JSON.stringify(newProject));

    // Navigate to Property Details screen
    navigate("/create-property", { state: { projectId: newProject.id } });
  };

  const isNextDisabled = !title.trim();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Welcome to e-DigiVault
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure Access to Documents
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Create New Project
          </h2>
          <div className="mt-2 h-px bg-border" />
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="Enter your Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Write the description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={500}
              className="rounded-xl resize-none"
            />
          </div>
        </div>
      </div>

      {/* Footer with Next Button */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="px-8 h-12 rounded-xl font-semibold"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
