import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, FileText, FolderClosed, FolderOpen, Plus, Search, Upload, MoreVertical, Download, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Document {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modifiedDate: string;
  sharedWith?: User[];
  sharedBy?: User;
  parentFolderId?: string | null;
  category: 'all' | 'my' | 'shared';
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com' },
];

const Documents = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Project Documents', type: 'folder', modifiedDate: '2024-02-20', category: 'my' },
    { id: '2', name: 'Site Photos', type: 'folder', modifiedDate: '2024-02-19', category: 'my' },
    { 
      id: '3', 
      name: 'Contract.pdf', 
      type: 'file', 
      size: '2.5 MB', 
      modifiedDate: '2024-02-18', 
      category: 'shared', 
      sharedWith: [
        { id: '1', name: 'John Doe', email: 'john@example.com' }, 
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ] 
    },
    { id: '4', name: 'Budget Report.xlsx', type: 'file', size: '1.8 MB', modifiedDate: '2024-02-17', category: 'my' },
    { 
      id: '5', 
      name: 'Team Documents', 
      type: 'folder', 
      modifiedDate: '2024-02-16', 
      category: 'shared', 
      sharedWith: [
        { id: '3', name: 'Alice Johnson', email: 'alice@example.com' }
      ] 
    },
    { id: '6', name: 'Site Plans.dwg', type: 'file', size: '5.2 MB', modifiedDate: '2024-02-15', category: 'my' }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/all')) return 'all';
    if (path.includes('/my')) return 'my';
    return 'all'; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      all: '/documents/all',
      my: '/documents/my'
    };
    navigate(tabRoutes[value]);
    setActiveTab(value);
  };
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Document | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Document | null>(null);
  
  const currentUser: User = { id: 'current', name: 'Current User', email: 'current@example.com' };

  const filteredDocuments = documents
    .filter(doc => {
      if (activeTab === 'all') return true;
      if (activeTab === 'my') return doc.category === 'my';
      if (activeTab === 'shared') return doc.category === 'shared' && doc.sharedWith?.some(user => user.id === currentUser.id);
      return false;
    })
    .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Document = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        type: 'folder',
        modifiedDate: new Date().toISOString().split('T')[0],
        category: 'my',
        parentFolderId: null
      };
      setDocuments(prev => [newFolder, ...prev]);
      setNewFolderName("");
      setIsNewFolderModalOpen(false);
      setActiveTab('my');
      toast({
        title: "Folder created",
        description: `Folder "${newFolderName.trim()}" has been created.`
      });
    }
  };

  const handleDelete = (id: string) => {
    const itemToDelete = documents.find(doc => doc.id === id);
    if (itemToDelete?.type === 'folder') {
      const hasFiles = documents.some(doc => doc.parentFolderId === id);
      if (hasFiles) {
        setFolderToDelete(itemToDelete);
        setIsDeleteDialogOpen(true);
        return;
      }
    }
    setDocuments(documents.filter(doc => doc.id !== id && doc.parentFolderId !== id));
    toast({
      title: "Item deleted",
      description: "The item has been deleted successfully."
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, folderId?: string) => {
    const files = e.target.files;
    if (files) {
      const newFiles: Document[] = Array.from(files).map(file => ({
        id: `file-${Date.now()}-${file.name}`,
        name: file.name,
        type: 'file',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        modifiedDate: new Date().toISOString().split('T')[0],
        category: 'my',
        parentFolderId: folderId
      }));
      setDocuments(prev => [...newFiles, ...prev]);
      if (folderId) {
        setIsFolderModalOpen(true);
      } else {
        setIsUploadModalOpen(false);
      }
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) have been uploaded.`
      });
    }
  };

  const handleDownload = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    let dummyData = '';
    
    switch (extension) {
      case 'pdf':
        dummyData = 'This is a dummy PDF content';
        break;
      case 'xlsx':
        dummyData = 'This is a dummy Excel content';
        break;
      case 'docx':
        dummyData = 'This is a dummy Word document content';
        break;
      default:
        dummyData = 'This is a dummy file content';
    }

    const blob = new Blob([dummyData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloading file",
      description: `${fileName} is being downloaded.`
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-400" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-400" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-6 w-6 text-green-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="h-6 w-6 text-purple-400" />;
      default:
        return <FileText className="h-6 w-6 text-gray-400" />;
    }
  };

  const getFolders = () => {
    return documents.filter(doc => doc.type === 'folder' && doc.category === 'my');
  };

  const handleOpenFolder = (folder: Document) => {
    setSelectedFolder(folder);
    setIsFolderModalOpen(true);
  };

  const getFolderContents = (folderId: string) => {
    return documents.filter(doc => doc.parentFolderId === folderId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">Access and manage all project documents and files</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button onClick={() => setIsNewFolderModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="all" value={getCurrentTab()} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">
            <FolderOpen className="mr-2 h-4 w-4" />
            All Files
          </TabsTrigger>
          <TabsTrigger value="my">
            <FileText className="mr-2 h-4 w-4" />
            My Documents
          </TabsTrigger>
          {/* <TabsTrigger value="shared">
            <File className="mr-2 h-4 w-4" />
            Shared With Me
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>View and manage all your documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
                  >
                    <div className="p-3 flex items-center justify-between border-b bg-muted/50">
                      <div className="flex items-center space-x-2">
                        {doc.type === 'folder' ? (
                          <FolderClosed className="h-5 w-5 text-blue-400" />
                        ) : (
                          getFileIcon(doc.name)
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{doc.name}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {doc.type === 'file' && (
                            <DropdownMenuItem onClick={() => handleDownload(doc.name)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          {doc.type === 'folder' && (
                            <DropdownMenuItem>
                              <FolderOpen className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Modified</span>
                        <span>{doc.modifiedDate}</span>
                      </div>
                      {doc.size && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Size</span>
                          <span>{doc.size}</span>
                        </div>
                      )}
                      {doc.sharedWith && doc.sharedWith.length > 0 && (
                        <div className="pt-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Shared • {doc.sharedWith.length}
                            </Badge>
                            <div className="flex -space-x-2">
                              {doc.sharedWith.slice(0, 3).map((person, index) => (
                                <div
                                  key={index}
                                  className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs ring-2 ring-background"
                                  title={person.name}
                                >
                                  {person.name.charAt(0)}
                                </div>
                              ))}
                              {doc.sharedWith.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs ring-2 ring-background">
                                  +{doc.sharedWith.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                      {doc.type === 'file' ? (
                        <Button size="sm" variant="secondary" className="pointer-events-auto" onClick={() => handleDownload(doc.name)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" className="pointer-events-auto" onClick={() => handleOpenFolder(doc)}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>Documents you own</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
                  >
                    <div className="p-3 flex items-center justify-between border-b bg-muted/50">
                      <div className="flex items-center space-x-2">
                        {doc.type === 'folder' ? (
                          <FolderClosed className="h-5 w-5 text-blue-400" />
                        ) : (
                          getFileIcon(doc.name)
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{doc.name}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {doc.type === 'file' && (
                            <DropdownMenuItem onClick={() => handleDownload(doc.name)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          {doc.type === 'folder' && (
                            <DropdownMenuItem>
                              <FolderOpen className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Modified</span>
                        <span>{doc.modifiedDate}</span>
                      </div>
                      {doc.size && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Size</span>
                          <span>{doc.size}</span>
                        </div>
                      )}
                      {doc.sharedWith && doc.sharedWith.length > 0 && (
                        <div className="pt-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Shared • {doc.sharedWith.length}
                            </Badge>
                            <div className="flex -space-x-2">
                              {doc.sharedWith.slice(0, 3).map((person, index) => (
                                <div
                                  key={index}
                                  className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs ring-2 ring-background"
                                  title={person.name}
                                >
                                  {person.name.charAt(0)}
                                </div>
                              ))}
                              {doc.sharedWith.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs ring-2 ring-background">
                                  +{doc.sharedWith.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                      {doc.type === 'file' ? (
                        <Button size="sm" variant="secondary" className="pointer-events-auto" onClick={() => handleDownload(doc.name)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" className="pointer-events-auto" onClick={() => handleOpenFolder(doc)}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Shared Documents</CardTitle>
              <CardDescription>Documents shared with you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
                  >
                    <div className="p-3 flex items-center justify-between border-b bg-muted/50">
                      <div className="flex items-center space-x-2">
                        {doc.type === 'folder' ? (
                          <FolderClosed className="h-5 w-5 text-blue-400" />
                        ) : (
                          getFileIcon(doc.name)
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{doc.name}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {doc.type === 'file' && (
                            <DropdownMenuItem onClick={() => handleDownload(doc.name)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          {doc.type === 'folder' && (
                            <DropdownMenuItem>
                              <FolderOpen className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Modified</span>
                        <span>{doc.modifiedDate}</span>
                      </div>
                      {doc.size && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Size</span>
                          <span>{doc.size}</span>
                        </div>
                      )}
                      {doc.sharedWith && doc.sharedWith.length > 0 && (
                        <div className="pt-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Shared • {doc.sharedWith.length}
                            </Badge>
                            <div className="flex -space-x-2">
                              {doc.sharedWith.slice(0, 3).map((person, index) => (
                                <div
                                  key={index}
                                  className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs ring-2 ring-background"
                                  title={person.name}
                                >
                                  {person.name.charAt(0)}
                                </div>
                              ))}
                              {doc.sharedWith.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs ring-2 ring-background">
                                  +{doc.sharedWith.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                      {doc.type === 'file' ? (
                        <Button size="sm" variant="secondary" className="pointer-events-auto" onClick={() => handleDownload(doc.name)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" className="pointer-events-auto" onClick={() => handleOpenFolder(doc)}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isNewFolderModalOpen} onOpenChange={setIsNewFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>Select files to upload to your documents</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="files">Files</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Input
                  id="files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e)}
                />
                <Label htmlFor="files" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload or drag and drop files here</span>
                  <span className="text-xs text-muted-foreground">Supported files: PDF, Word, Excel, Images</span>
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-400" />
                {selectedFolder?.name}
              </DialogTitle>
              <DialogDescription>Manage files in this folder</DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsFolderModalOpen(false)}
              className="h-8 w-8"
            >
              {/* <X className="h-4 w-4" /> */}
            </Button>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => document.getElementById('folderUpload')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
              <Input
                id="folderUpload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e, selectedFolder?.id)}
              />
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (selectedFolder) {
                    const hasFiles = getFolderContents(selectedFolder.id).length > 0;
                    if (hasFiles) {
                      setFolderToDelete(selectedFolder);
                      setIsDeleteDialogOpen(true);
                    } else {
                      handleDelete(selectedFolder.id);
                    }
                    setIsFolderModalOpen(false);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Folder
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFolder && getFolderContents(selectedFolder.id).map((file) => (
                <div
                  key={file.id}
                  className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
                >
                  <div className="p-3 flex items-center justify-between border-b bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{file.name}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleDownload(file.name)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(file.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Modified</span>
                      <span>{file.modifiedDate}</span>
                    </div>
                    {file.size && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Size</span>
                        <span>{file.size}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              This folder contains files. Are you sure you want to delete the folder and all its contents?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setFolderToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (folderToDelete) {
                setDocuments(prev => prev.filter(doc => 
                  doc.id !== folderToDelete.id && doc.parentFolderId !== folderToDelete.id
                ));
                toast({
                  title: "Folder deleted",
                  description: "The folder and its contents have been deleted."
                });
              }
              setIsDeleteDialogOpen(false);
              setFolderToDelete(null);
            }}>
              Delete Folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;
