import { Card, CardContent } from "@/components/ui/card"

interface JobDetailsProps {
  job: any
}

export function JobDetails({ job }: JobDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Descrição da Vaga</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{job.description?.pt || "Sem descrição"}</p>
          </div>
        </CardContent>
      </Card>

      {job.requirements?.pt && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Requisitos</h3>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{job.requirements.pt}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {job.benefits?.pt && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Benefícios</h3>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{job.benefits.pt}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
