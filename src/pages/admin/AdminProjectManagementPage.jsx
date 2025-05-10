import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Search, Edit, Trash2, MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const CreateProjectModal = ({ isOpen, setIsOpen, onProjectCreate }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [center, setCenter] = useState(defaultCenter);
  const [radius, setRadius] = useState(100);
  const { toast } = useToast();

  const onMapClick = useCallback((e) => {
    setCenter({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName || !locationName) {
      toast({ variant: "destructive", title: "Error", description: "Please fill all required fields." });
      return;
    }

    onProjectCreate({ 
      name: projectName, 
      description: projectDescription, 
      locationName, 
      latitude: center.lat, 
      longitude: center.lng,
      radius: radius,
      status: 'Planning', 
      manager: 'Unassigned' 
    });
    setProjectName('');
    setProjectDescription('');
    setLocationName('');
    setCenter(defaultCenter);
    setRadius(100);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] bg-card glassmorphism-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-tertiary">Create New Project</DialogTitle>
          <DialogDescription>Fill in the details below to create a new construction project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="text-right text-muted-foreground">Name</Label>
              <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="col-span-3 bg-background/70" placeholder="e.g., Skyscraper Alpha" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectDescription" className="text-right text-muted-foreground">Description</Label>
              <Input id="projectDescription" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} className="col-span-3 bg-background/70" placeholder="Brief project overview" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="locationName" className="text-right text-muted-foreground">Location Name</Label>
              <Input id="locationName" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="col-span-3 bg-background/70" placeholder="e.g., City Center Plaza" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="radius" className="text-right text-muted-foreground">Radius (meters)</Label>
              <Input 
                id="radius" 
                type="number" 
                value={radius} 
                onChange={(e) => setRadius(Number(e.target.value))} 
                className="col-span-3 bg-background/70" 
                placeholder="Enter radius in meters"
                min="50"
                max="1000"
              />
            </div>
            <div className="col-span-4">
              <Label className="mb-2 block text-muted-foreground">Select Location (Click on map)</Label>
              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={13}
                  onClick={onMapClick}
                >
                  <Marker position={center} />
                  <Circle
                    center={center}
                    radius={radius}
                    options={{
                      fillColor: 'rgba(66, 133, 244, 0.2)',
                      strokeColor: '#4285F4',
                      strokeWeight: 2,
                    }}
                  />
                </GoogleMap>
              </LoadScript>
              <p className="mt-2 text-sm text-muted-foreground">
                Selected coordinates: {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="bg-secondary/50 hover:bg-secondary/80">Cancel</Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function AdminProjectManagementPage() {
  const { projects, addProject } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-tertiary">
          Project Management (Admin)
        </h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle size={18} className="mr-2" /> Create New Project
        </Button>
      </motion.div>

      <CreateProjectModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onProjectCreate={addProject} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="glassmorphism-card mb-8">
          <CardHeader>
            <CardTitle>Filter Projects</CardTitle>
            <CardDescription>Search projects by name or location.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Input 
                type="search" 
                placeholder="Search projects..." 
                className="pl-10 bg-background/70" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {filteredProjects.length === 0 && searchTerm && (
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
            >
                <p className="text-muted-foreground text-lg">No projects found matching "{searchTerm}".</p>
            </motion.div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.3, duration: 0.4 }}
            >
              <Card className="glassmorphism-card h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">{project.name}</CardTitle>
                  <CardDescription className="flex items-center text-muted-foreground">
                    <MapPin size={14} className="mr-1" /> {project.locationName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm mb-2">{project.description}</p>
                  <p className="text-sm mb-1"><span className="font-semibold text-muted-foreground">Status:</span> {project.status}</p>
                  <p className="text-sm mb-1"><span className="font-semibold text-muted-foreground">Manager:</span> {project.manager}</p>
                  <p className="text-sm"><span className="font-semibold text-muted-foreground">Coordinates:</span> Lat: {project.latitude.toFixed(4)}, Lon: {project.longitude.toFixed(4)}</p>
                   <p className="text-sm text-muted-foreground mt-1">(Radius: {project.radius}m)</p>
                </CardContent>
                <CardFooter className="border-t border-border/20 flex justify-end space-x-2 pt-4">
                   <Button variant="ghost" size="sm" className="hover:bg-primary/10 text-primary">
                    <Edit size={16} className="mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-destructive/10 text-destructive">
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
         {filteredProjects.length === 0 && !searchTerm && (
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
            >
                <Globe size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-xl">No projects created yet.</p>
                <p className="text-muted-foreground">Click "Create New Project" to get started.</p>
            </motion.div>
        )}
      </motion.div>
    </div>
  );
}