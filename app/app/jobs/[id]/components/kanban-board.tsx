"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { createClient } from "@/lib/supabase/client"
import { CandidateCard } from "./candidate-card"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"

interface KanbanBoardProps {
  jobId: string
}

const stages = [
  { id: "new", name: "Novos" },
  { id: "phone-screen", name: "Triagem" },
  { id: "interview", name: "Entrevista" },
  { id: "technical", name: "Técnico" },
  { id: "offer", name: "Proposta" },
  { id: "hired", name: "Contratados" },
]

export function KanbanBoard({ jobId }: KanbanBoardProps) {
  const [applications, setApplications] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true)
      try {
        const { data } = await supabase
          .from("applications")
          .select(`
            *,
            candidate:candidates(*)
          `)
          .eq("job_id", jobId)
          .order("updated_at", { ascending: false })

        // Organizar aplicações por estágio
        const applicationsByStage: Record<string, any[]> = {}
        stages.forEach((stage) => {
          applicationsByStage[stage.id] = []
        })

        if (data) {
          data.forEach((application) => {
            if (applicationsByStage[application.stage]) {
              applicationsByStage[application.stage].push(application)
            } else {
              applicationsByStage["new"].push(application)
            }
          })
        }

        setApplications(applicationsByStage)
      } catch (error) {
        console.error("Erro ao buscar candidaturas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [jobId, supabase])

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Se não houver destino ou o destino for o mesmo que a origem, não fazer nada
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Atualizar o estado localmente primeiro (otimista)
    const sourceStage = source.droppableId
    const destinationStage = destination.droppableId
    const applicationToMove = applications[sourceStage].find((app) => app.id === draggableId)

    if (!applicationToMove) return

    // Remover da origem
    const newSourceApplications = [...applications[sourceStage]]
    newSourceApplications.splice(source.index, 1)

    // Adicionar ao destino
    const newDestinationApplications = [...applications[destinationStage]]
    newDestinationApplications.splice(destination.index, 0, {
      ...applicationToMove,
      stage: destinationStage,
    })

    // Atualizar o estado
    setApplications({
      ...applications,
      [sourceStage]: newSourceApplications,
      [destinationStage]: newDestinationApplications,
    })

    // Atualizar no banco de dados
    try {
      await supabase
        .from("applications")
        .update({
          stage: destinationStage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draggableId)

      // Registrar atividade
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("activity_log").insert({
          company_id: applicationToMove.company_id,
          user_id: user.id,
          entity_type: "application",
          entity_id: draggableId,
          action: "application_stage_changed",
          metadata: {
            from_stage: sourceStage,
            to_stage: destinationStage,
            candidate_name: applicationToMove.candidate?.name,
          },
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar estágio da candidatura:", error)
      // Reverter o estado em caso de erro
      setApplications({
        ...applications,
        [sourceStage]: [...applications[sourceStage]],
        [destinationStage]: [...applications[destinationStage]],
      })
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Candidato
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="min-w-[250px]">
              <div className="bg-gray-100 rounded-t-lg p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">{stage.name}</h3>
                  <span className="text-xs bg-white text-gray-600 rounded-full px-2 py-1">
                    {applications[stage.id]?.length || 0}
                  </span>
                </div>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 rounded-b-lg p-2 min-h-[500px]"
                  >
                    {applications[stage.id]?.map((application, index) => (
                      <Draggable key={application.id} draggableId={application.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2"
                          >
                            <CandidateCard application={application} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {applications[stage.id]?.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">Nenhum candidato</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
