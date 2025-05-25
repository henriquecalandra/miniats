"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users, Star, Mail, Phone } from "lucide-react"

interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  skills: string[]
  experience: string
  status: "available" | "hired" | "interviewing"
  rating: number
  avatar?: string
}

export default function TalentPoolPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setCandidates([
        {
          id: "1",
          name: "Ana Silva",
          email: "ana@email.com",
          phone: "(11) 99999-9999",
          position: "Desenvolvedora Frontend",
          skills: ["React", "TypeScript", "CSS"],
          experience: "3 anos",
          status: "available",
          rating: 4.5,
        },
        {
          id: "2",
          name: "Carlos Santos",
          email: "carlos@email.com",
          position: "Designer UX/UI",
          skills: ["Figma", "Adobe XD", "Prototyping"],
          experience: "5 anos",
          status: "interviewing",
          rating: 4.8,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = filterStatus === "all" || candidate.status === filterStatus

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banco de Talentos</h1>
          <p className="text-gray-600">Gerencie seu pool de candidatos</p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Adicionar Candidato
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Candidatos</p>
                <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {candidates.filter((c) => c.status === "available").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Processo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {candidates.filter((c) => c.status === "interviewing").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contratados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {candidates.filter((c) => c.status === "hired").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, cargo ou habilidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === "available" ? "default" : "outline"}
                onClick={() => setFilterStatus("available")}
                size="sm"
              >
                Disponíveis
              </Button>
              <Button
                variant={filterStatus === "interviewing" ? "default" : "outline"}
                onClick={() => setFilterStatus("interviewing")}
                size="sm"
              >
                Em Processo
              </Button>
              <Button
                variant={filterStatus === "hired" ? "default" : "outline"}
                onClick={() => setFilterStatus("hired")}
                size="sm"
              >
                Contratados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{candidate.name}</CardTitle>
                    <p className="text-sm text-gray-600">{candidate.position}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    candidate.status === "available"
                      ? "default"
                      : candidate.status === "interviewing"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {candidate.status === "available"
                    ? "Disponível"
                    : candidate.status === "interviewing"
                      ? "Em Processo"
                      : "Contratado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {candidate.email}
                </div>
                {candidate.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {candidate.phone}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Habilidades:</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Experiência: {candidate.experience}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{candidate.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    Ver Perfil
                  </Button>
                  <Button size="sm" variant="outline">
                    Contatar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum candidato encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando candidatos ao seu banco de talentos"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
