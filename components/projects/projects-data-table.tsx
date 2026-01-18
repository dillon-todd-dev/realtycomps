'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import {
  getProjects,
  deleteProject,
  toggleProjectPublished,
  getProjectImageUrl,
  ProjectWithImages,
} from '@/actions/projects';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Loader2,
  Plus,
  MoreHorizontal,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import EditProjectModal from './edit-project-modal';

interface ProjectsDataTableProps {
  initialData: {
    projects: ProjectWithImages[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
  };
}

export default function ProjectsDataTable({
  initialData,
}: ProjectsDataTableProps) {
  const [projects, setProjects] = useState(initialData.projects);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [pageCount, setPageCount] = useState(initialData.pageCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [editingProject, setEditingProject] = useState<ProjectWithImages | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithImages | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const debouncedSearch = useDebounce(search, 300);
  const pageSize = 10;

  const fetchProjects = useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await getProjects({
          page: currentPage,
          pageSize,
          search: debouncedSearch,
        });

        setProjects(result.projects);
        setTotalCount(result.totalCount);
        setPageCount(result.pageCount);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch projects');
      }
    });
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch signed URLs for thumbnails
  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const project of projects) {
        if (project.images.length > 0) {
          const url = await getProjectImageUrl(project.images[0].url, 60);
          if (url) {
            urls[project.id] = url;
          }
        }
      }
      setImageUrls(urls);
    };
    fetchImageUrls();
  }, [projects]);

  const handleTogglePublished = async (project: ProjectWithImages) => {
    try {
      const result = await toggleProjectPublished(project.id);
      toast.success(
        result.isPublished ? 'Project published' : 'Project unpublished',
      );
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;

    try {
      await deleteProject(deletingProject.id);
      toast.success('Project deleted');
      setDeletingProject(null);
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-sm font-medium">Projects</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Manage projects shown on public page
          </p>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40 sm:w-64"
          />
          <Button asChild>
            <Link href="/dashboard/projects/create">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Project</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-4">
        {isPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!isPending && (
          <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No projects found
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className={`rounded-lg border bg-card p-4 ${
                      !project.isPublished ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {imageUrls[project.id] ? (
                          <Image
                            src={imageUrls[project.id]}
                            alt={project.title}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium truncate">{project.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {project.images.length} image{project.images.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingProject(project)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePublished(project)}>
                                {project.isPublished ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingProject(project)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              project.isPublished
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {project.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center w-24">Images</TableHead>
                    <TableHead className="text-center w-28">Status</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow
                        key={project.id}
                        className={!project.isPublished ? 'opacity-60' : ''}
                      >
                        <TableCell>
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            {imageUrls[project.id] ? (
                              <Image
                                src={imageUrls[project.id]}
                                alt={project.title}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {project.images.length}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              project.isPublished
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {project.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingProject(project)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePublished(project)}>
                                {project.isPublished ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingProject(project)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {projects.length} of {totalCount} projects
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-3 text-sm">
                      {currentPage} / {pageCount}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                      disabled={currentPage === pageCount}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          onSuccess={fetchProjects}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingProject?.title}&quot;? This will also
              delete all {deletingProject?.images.length || 0} associated images. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
