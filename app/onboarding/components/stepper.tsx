interface StepperProps {
  currentStep: number
  steps: string[]
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="relative">
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        <div
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
        ></div>
      </div>
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${index + 1 <= currentStep ? "text-blue-600" : "text-gray-400"}`}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
                index + 1 <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {index + 1 <= currentStep ? (
                index + 1 === currentStep ? (
                  index + 1
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              ) : (
                index + 1
              )}
            </div>
            <span className="text-xs text-center">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
