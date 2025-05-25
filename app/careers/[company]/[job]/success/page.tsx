import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SuccessPageProps {
  params: {
    company: string
  }
}

export default function SuccessPage({ params }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Candidatura enviada com sucesso!</h1>
        <p className="text-gray-600 mb-6">
          Obrigado por se candidatar. Entraremos em contato em breve para dar continuidade ao processo seletivo.
        </p>
        <Button asChild>
          <Link href={`/careers/${params.company}`}>Ver outras vagas</Link>
        </Button>
      </div>
    </div>
  )
}
