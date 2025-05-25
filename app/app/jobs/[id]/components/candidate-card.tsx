"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreVertical, Star, Mail, Calendar, FileText, X } from "lucide-react"

interface CandidateCardProps {
  application: any
}

export function CandidateCard({ application }: CandidateCardProps) {
  const [rating, setRating] = useState(application.rating || 0)

  const handleRating = (newRating: number) => {
    // Se clicar na mesma estrela, remove a classificação
    if (newRating === rating) {
      setRating(0)
    } else {
      setRating(newRating)
    }
    // Aqui você adicionaria a lógica para salvar a classificação no banco de dados
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{application.candidate?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-gray-900 line-clamp-1">
                <Link href={`/app/candidates/${application.candidate?.id}`} className="hover:text-blue-600">
                  {application.candidate?.name || "Candidato"}
                </Link>
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">
                {application.candidate?.email || "Email não disponível"}
              </p>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 cursor-pointer ${
                      star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => handleRating(star)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                <span>Enviar Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Agendar Entrevista</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver Currículo</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <X className="mr-2 h-4 w-4" />
                <span>Rejeitar Candidato</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {application.candidate?.location && (
              <Badge variant="outline" className="text-xs">
                {application.candidate.location}
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(application.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
