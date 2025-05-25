"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface SuccessStepProps {
  onComplete: () => void
}

export function SuccessStep({ onComplete }: SuccessStepProps) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Configuração concluída!</h2>
      <p className="text-gray-600 mb-6">
        Sua empresa foi configurada com sucesso. Você está pronto para começar a usar o Mini ATS.
      </p>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Seu período de teste de 14 dias começou. Durante este período, você tem acesso a todas as funcionalidades do
          sistema.
        </p>
        <Button onClick={onComplete} className="w-full">
          Ir para o Dashboard
        </Button>
      </div>
    </div>
  )
}
