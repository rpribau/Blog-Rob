import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink } from 'lucide-react'

interface Project {
  slug: string
  title: string
  description: string
  image: string
  logo: string
  date: string
  tags: string[]
  featured: boolean
  links: {
    github: string
    live?: string
  }
}

function parseFrontMatter(content: string): Record<string, any> {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);
  
  if (!match) return {};

  const frontMatter = match[1];
  const data: Record<string, any> = {};
  
  frontMatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      let value = valueParts.join(':').trim();
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(item => item.trim());
      }
      // Parse booleans
      else if (value === 'true' || value === 'false') {
        value = value === 'true';
      }
      // Parse nested objects
      else if (value.startsWith('{') && value.endsWith('}')) {
        value = JSON.parse(value);
      }
      data[key.trim()] = value;
    }
  });

  return data;
}

export default function ProjectsPage() {
  const projectsDirectory = path.join(process.cwd(), 'public', 'projects')
  let projects: Project[] = []

  try {
    if (fs.existsSync(projectsDirectory)) {
      const filenames = fs.readdirSync(projectsDirectory)

      projects = filenames.map(filename => {
        const filePath = path.join(projectsDirectory, filename)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const frontMatter = parseFrontMatter(fileContents)
        
        const project: Project = {
          slug: filename.replace('.md', ''),
          title: frontMatter.title || filename,
          description: frontMatter.description || '',
          image: frontMatter.image?.startsWith('/') || frontMatter.image?.startsWith('http')
            ? frontMatter.image
            : '',
          logo: frontMatter.logo?.startsWith('/') || frontMatter.logo?.startsWith('http')
            ? frontMatter.logo
            : '',
          date: frontMatter.date || '',
          tags: frontMatter.tags || [],
          featured: frontMatter.featured || false,
          links: frontMatter.links || { github: '' },
        };
        

        return project;
      })
    } else {
      console.warn("Projects directory does not exist:", projectsDirectory)
    }
  } catch (error) {
    console.error("Error reading projects directory:", error)
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">No projects found</h2>
        <p>Check back later for new content!</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Projects</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <Card key={project.slug} className="overflow-hidden flex flex-col">
            <div className="relative h-48">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1">
                <Image
                  src={project.logo}
                  alt={`${project.title} logo`}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">
                <Link href={`/projects/${project.slug}`} className="hover:underline">
                  {project.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(project.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              {project.links.github ? (
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <Github className="mr-2 h-4 w-4" />
                  No Repo
                </Button>
              )}
              {project.links.live ? (
                <Button size="sm" className="flex-1" asChild>
                  <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Live Demo
                  </a>
                </Button>
              ) : (
                <Button size="sm" className="flex-1" disabled>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  No Demo
                </Button>
              )}
            </CardFooter>

          </Card>
        ))}
      </div>
    </div>
  )
}
