import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Settings,
  User,
  Bell,
  Clock,
  Palette,
  Shield,
  Save,
  Edit,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { useAppContext } from "../../App";

const SettingsPage = () => {
  const { currentUser, availableTopics, availableCompanies, API } =
    useAppContext();

  const [settings, setSettings] = useState({
    // Profile settings
    username: currentUser?.username || "",
    email: currentUser?.email || "",

    // Quiz settings
    defaultQuestions: 10,
    defaultDifficulty: "all",
    enableTimer: true,
    timerDuration: 60,

    // Notification settings
    emailNotifications: true,
    weeklyProgress: true,
    streakReminders: true,

    // Theme settings
    theme: "light",

    // Privacy settings
    profileVisible: true,
    shareProgress: false,

    // Topics and companies
    selectedTopics: currentUser?.selected_topics || [],
    selectedCompanies: currentUser?.target_companies || [],
  });

  const [editing, setEditing] = useState({
    profile: false,
    topics: false,
    companies: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setSettings((prev) => ({
        ...prev,
        username: currentUser.username,
        email: currentUser.email,
        selectedTopics: currentUser.selected_topics || [],
        selectedCompanies: currentUser.target_companies || [],
      }));
    }
  }, [currentUser]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleTopic = (topic) => {
    setSettings((prev) => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topic)
        ? prev.selectedTopics.filter((t) => t !== topic)
        : [...prev.selectedTopics, topic],
    }));
  };

  const toggleCompany = (company) => {
    setSettings((prev) => ({
      ...prev,
      selectedCompanies: prev.selectedCompanies.includes(company)
        ? prev.selectedCompanies.filter((c) => c !== company)
        : [...prev.selectedCompanies, company],
    }));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      // Update profile info - in real app this would be separate endpoints
      toast.success("Profile updated successfully!");
      setEditing((prev) => ({ ...prev, profile: false }));
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const saveTopics = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/users/${currentUser.id}/topics`, {
        selected_topics: settings.selectedTopics,
        custom_topics: [],
      });
      toast.success("Topics updated successfully!");
      setEditing((prev) => ({ ...prev, topics: false }));
    } catch (error) {
      toast.error("Failed to update topics");
    } finally {
      setLoading(false);
    }
  };

  const saveCompanies = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/users/${currentUser.id}/companies`, {
        companies: settings.selectedCompanies,
      });
      toast.success("Companies updated successfully!");
      setEditing((prev) => ({ ...prev, companies: false }));
    } catch (error) {
      toast.error("Failed to update companies");
    } finally {
      setLoading(false);
    }
  };

  const saveAllSettings = async () => {
    setLoading(true);
    try {
      // Save all settings - in real app these would be separate API calls
      await Promise.all(
        [
          settings.selectedTopics !== currentUser?.selected_topics &&
            saveTopics(),
          settings.selectedCompanies !== currentUser?.target_companies &&
            saveCompanies(),
        ].filter(Boolean)
      );

      toast.success("All settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save some settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
        </div>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Customize your Interview Prep Pro experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">Profile Settings</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing((prev) => ({ ...prev, profile: !prev.profile }))
                  }
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {editing.profile ? "Cancel" : "Edit"}
                </Button>
              </div>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={settings.username}
                    onChange={(e) =>
                      handleSettingChange("username", e.target.value)
                    }
                    disabled={!editing.profile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      handleSettingChange("email", e.target.value)
                    }
                    disabled={!editing.profile}
                  />
                </div>
              </div>

              {editing.profile && (
                <div className="flex space-x-2">
                  <Button onClick={saveProfile} disabled={loading}>
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <CardTitle className="text-xl">Quiz Preferences</CardTitle>
              </div>
              <CardDescription>
                Set your default quiz configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultQuestions">Default Questions</Label>
                  <Select
                    value={settings.defaultQuestions.toString()}
                    onValueChange={(value) =>
                      handleSettingChange("defaultQuestions", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                      <SelectItem value="25">25 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultDifficulty">Default Difficulty</Label>
                  <Select
                    value={settings.defaultDifficulty}
                    onValueChange={(value) =>
                      handleSettingChange("defaultDifficulty", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                      <SelectItem value="Very Hard">Very Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <Label>Enable Timer by Default</Label>
                    <p className="text-sm text-slate-500">
                      Automatically start timer for new quizzes
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableTimer}
                    onCheckedChange={(checked) =>
                      handleSettingChange("enableTimer", checked)
                    }
                  />
                </div>

                {settings.enableTimer && (
                  <div className="space-y-2 ml-4">
                    <Label htmlFor="timerDuration">
                      Default Timer Duration (seconds)
                    </Label>
                    <Input
                      id="timerDuration"
                      type="number"
                      min="30"
                      max="300"
                      value={settings.timerDuration}
                      onChange={(e) =>
                        handleSettingChange(
                          "timerDuration",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-xl">Notifications</CardTitle>
              </div>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  key: "emailNotifications",
                  label: "Email Notifications",
                  desc: "Receive updates via email",
                },
                {
                  key: "weeklyProgress",
                  label: "Weekly Progress Report",
                  desc: "Get weekly summaries of your progress",
                },
                {
                  key: "streakReminders",
                  label: "Streak Reminders",
                  desc: "Reminders to maintain your study streak",
                },
              ].map((notification) => (
                <div
                  key={notification.key}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <Label>{notification.label}</Label>
                    <p className="text-sm text-slate-500">
                      {notification.desc}
                    </p>
                  </div>
                  <Switch
                    checked={settings[notification.key]}
                    onCheckedChange={(checked) =>
                      handleSettingChange(notification.key, checked)
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-xl">Privacy & Sharing</CardTitle>
              </div>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  key: "profileVisible",
                  label: "Public Profile",
                  desc: "Make your profile visible to other users",
                },
                {
                  key: "shareProgress",
                  label: "Share Progress",
                  desc: "Allow others to see your learning progress",
                },
              ].map((privacy) => (
                <div
                  key={privacy.key}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <Label>{privacy.label}</Label>
                    <p className="text-sm text-slate-500">{privacy.desc}</p>
                  </div>
                  <Switch
                    checked={settings[privacy.key]}
                    onCheckedChange={(checked) =>
                      handleSettingChange(privacy.key, checked)
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Topics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">My Topics</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing((prev) => ({ ...prev, topics: !prev.topics }))
                  }
                >
                  {editing.topics ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                {editing.topics
                  ? "Select your topics"
                  : `${settings.selectedTopics.length} topics selected`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editing.topics ? (
                <div className="space-y-3">
                  <ScrollArea className="h-40 w-full rounded-md border border-slate-200 p-3">
                    <div className="space-y-2">
                      {availableTopics.map((topic) => (
                        <div
                          key={topic}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`topic-${topic}`}
                            checked={settings.selectedTopics.includes(topic)}
                            onCheckedChange={() => toggleTopic(topic)}
                          />
                          <Label
                            htmlFor={`topic-${topic}`}
                            className="text-sm cursor-pointer"
                          >
                            {topic}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex space-x-2">
                    <Button onClick={saveTopics} disabled={loading} size="sm">
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditing((prev) => ({ ...prev, topics: false }))
                      }
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {settings.selectedTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="text-xs"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Companies */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Target Companies</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing((prev) => ({
                      ...prev,
                      companies: !prev.companies,
                    }))
                  }
                >
                  {editing.companies ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                {editing.companies
                  ? "Select target companies"
                  : `${settings.selectedCompanies.length} companies selected`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editing.companies ? (
                <div className="space-y-3">
                  <ScrollArea className="h-40 w-full rounded-md border border-slate-200 p-3">
                    <div className="space-y-2">
                      {availableCompanies.map((company) => (
                        <div
                          key={company}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`company-${company}`}
                            checked={settings.selectedCompanies.includes(
                              company
                            )}
                            onCheckedChange={() => toggleCompany(company)}
                          />
                          <Label
                            htmlFor={`company-${company}`}
                            className="text-sm cursor-pointer"
                          >
                            {company}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex space-x-2">
                    <Button
                      onClick={saveCompanies}
                      disabled={loading}
                      size="sm"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditing((prev) => ({ ...prev, companies: false }))
                      }
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {settings.selectedCompanies.map((company) => (
                      <Badge
                        key={company}
                        variant="secondary"
                        className="text-xs"
                      >
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-lg">Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange("theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save All */}
          <Button
            onClick={saveAllSettings}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
