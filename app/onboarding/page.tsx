"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stepper } from "./components/stepper"
import { CompanyForm } from "./components/company-form"
import { JobForm } from "./components/job-form"
import { CareerPageForm } from "./components/career-page-form"
import { SuccessStep } from "./components/success-step"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [companyData, setCompanyData] = useState<any>(null)
  const [jobData, setJobData] = useState<any>(null)
  const [careerPageData, setCareerPageData] = useState<any>(null)
  const router = useRouter()

  const handleCompanySubmit = (data: any) => {
    setCompanyData(data)
    setStep(2)
  }

  const handleJobSubmit = (data: any) => {
    setJobData(data)
    setStep(3)
  }

  const handleCareerPageSubmit = (data: any) => {
    setCareerPageData(data)
    setStep(4)
  }

  const handleComplete = () => {
    router.push("/dashboard")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bem-vindo ao Mini ATS</CardTitle>
          <CardDescription>Configure sua empresa em poucos passos</CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper
            currentStep={step}
            steps={["Perfil da empresa", "Primeira vaga", "Página de carreiras", "Concluído"]}
          />

          <div className="mt-8">
            {step === 1 && <CompanyForm onSubmit={handleCompanySubmit} />}

            {step === 2 && <JobForm onSubmit={handleJobSubmit} onBack={() => setStep(1)} />}

            {step === 3 && <CareerPageForm onSubmit={handleCareerPageSubmit} onBack={() => setStep(2)} />}

            {step === 4 && <SuccessStep onComplete={handleComplete} />}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
