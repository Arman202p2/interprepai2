import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Brain, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { useAppContext } from "../../App";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { availableTopics, availableCompanies, API } = useAppContext();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    selectedTopics: [],
    selectedCompanies: []
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleTopic = (topic) => {
    setFormData({
      ...formData,
      selectedTopics: formData.selectedTopics.includes(topic)
        ? formData.selectedTopics.filter(t => t !== topic)
        : [...formData.selectedTopics, topic]
    });
  };

  const toggleCompany = (company) => {
    setFormData({
      ...formData,
      selectedCompanies: formData.selectedCompanies.includes(company)
        ? formData.selectedCompanies.filter(c => c !== company)
        : [...formData.selectedCompanies, company]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.selectedTopics.length === 0) {
      toast.error("Please select at least one topic");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/users/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        selected_topics: formData.selectedTopics,
        custom_topics: [],
        target_companies: formData.selectedCompanies
      });
      
      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Join Interview Prep Pro</h1>
          <p className="text-slate-600 text-lg">Start your interview preparation journey</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">Create your account</CardTitle>
            <CardDescription className="text-slate-600">
              Get personalized interview questions from expert mentors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="johndoe"
                      className="pl-10 h-12 border-slate-200 bg-white/50 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="pl-10 h-12 border-slate-200 bg-white/50 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="pl-10 h-12 border-slate-200 bg-white/50 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Topics Selection */}
              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">
                  Select your topics ({formData.selectedTopics.length} selected)
                </Label>
                <ScrollArea className="h-32 w-full rounded-md border border-slate-200 bg-white/50 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {availableTopics.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={`topic-${topic}`}
                          checked={formData.selectedTopics.includes(topic)}
                          onCheckedChange={() => toggleTopic(topic)}
                        />
                        <Label
                          htmlFor={`topic-${topic}`}
                          className="text-sm text-slate-700 cursor-pointer"
                        >
                          {topic}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Companies Selection */}
              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">
                  Target companies (optional) ({formData.selectedCompanies.length} selected)
                </Label>
                <ScrollArea className="h-32 w-full rounded-md border border-slate-200 bg-white/50 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {availableCompanies.map((company) => (
                      <div key={company} className="flex items-center space-x-2">
                        <Checkbox
                          id={`company-${company}`}
                          checked={formData.selectedCompanies.includes(company)}
                          onCheckedChange={() => toggleCompany(company)}
                        />
                        <Label
                          htmlFor={`company-${company}`}
                          className="text-sm text-slate-700 cursor-pointer"
                        >
                          {company}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Button
                type="submit"
                disabled={loading || formData.selectedTopics.length === 0}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Create account
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;