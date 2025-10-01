import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Star, 
  ExternalLink, 
  BookOpen, 
  Building2, 
  MapPin, 
  Filter,
  Search,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAppContext } from "../../App";

const MentorsPage = () => {
  const navigate = useNavigate();
  const { mentors } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedExpertise, setSelectedExpertise] = useState("all");

  // Get unique companies and expertise areas
  const companies = [...new Set(mentors.map(m => m.company))];
  const expertiseAreas = [...new Set(mentors.flatMap(m => m.expertise))];

  // Filter mentors based on search and filters
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCompany = selectedCompany === "all" || mentor.company === selectedCompany;
    const matchesExpertise = selectedExpertise === "all" || mentor.expertise.includes(selectedExpertise);
    
    return matchesSearch && matchesCompany && matchesExpertise;
  });

  const startPracticeWithMentor = (mentor) => {
    // Navigate to practice page with mentor pre-selected
    navigate("/practice", { state: { selectedMentor: mentor } });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Expert Mentors</h1>
        </div>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Learn from industry professionals with real-world experience at top tech companies. 
          Get personalized questions and insights to ace your interviews.
        </p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
              <SelectTrigger>
                <SelectValue placeholder="All Expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expertise</SelectItem>
                {expertiseAreas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCompany("all");
                setSelectedExpertise("all");
              }}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600">
          Showing <span className="font-semibold">{filteredMentors.length}</span> mentors
        </p>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card 
            key={mentor.id} 
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{mentor.avatar}</div>
                  <div>
                    <CardTitle className="text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      {mentor.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {mentor.title}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-600">{mentor.rating}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Company */}
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">{mentor.company}</span>
                <Badge variant="secondary" className="text-xs">
                  {mentor.experience}
                </Badge>
              </div>

              {/* Expertise */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Expertise
                </p>
                <div className="flex flex-wrap gap-1">
                  {mentor.expertise.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mentor.expertise.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.expertise.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-slate-600 line-clamp-2">
                {mentor.bio}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{mentor.questionCount} questions</span>
                </div>
                
                <a
                  href={mentor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="text-xs">LinkedIn</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => startPracticeWithMentor(mentor)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group"
                >
                  Practice with {mentor.name.split(' ')[0]}
                  <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMentors.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No mentors found</h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your search criteria or browse all mentors.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCompany("all");
                setSelectedExpertise("all");
              }}
              variant="outline"
            >
              View All Mentors
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to learn from the best?
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Our mentors have helped thousands of candidates land their dream jobs at top tech companies. 
            Start practicing with personalized questions tailored to your target role.
          </p>
          <Button
            onClick={() => navigate("/practice")}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Your Practice Session
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorsPage;