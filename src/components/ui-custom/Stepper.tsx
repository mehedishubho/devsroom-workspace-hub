
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface StepperProps {
  steps: { label: string }[];
  activeStep: number;
  onStepClick?: (step: number) => void;
  completedStep?: number;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepClick,
  completedStep,
}) => {
  return (
    <nav className="w-full flex justify-center mb-10">
      <ol className="flex w-full max-w-2xl justify-between items-center relative px-2 sm:px-0">
        {steps.map((step, idx) => {
          const isCompleted = completedStep !== undefined && idx < completedStep;
          const isActive = idx === activeStep;
          const isLast = idx === steps.length - 1;

          return (
            <li key={step.label} className="flex-1 flex flex-col items-center relative min-w-[0]">
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(idx)}
                className={cn(
                  "transition-colors duration-200 flex items-center justify-center font-bold rounded-full border-2 h-10 w-10 sm:h-12 sm:w-12 shadow",
                  isCompleted
                    ? "bg-violet-600 text-white border-violet-600"
                    : isActive
                    ? "bg-white text-violet-700 border-violet-600"
                    : "bg-gray-200 text-gray-500 border-gray-200",
                  onStepClick ? "cursor-pointer" : "cursor-default"
                )}
                aria-current={isActive ? "step" : undefined}
                tabIndex={0}
              >
                {isCompleted ? <span className="block w-5 h-5 rounded-full bg-violet-600 mx-auto"></span> : idx + 1}
              </button>
              <span className={cn(
                "text-xs sm:text-sm mt-2 text-center font-semibold whitespace-nowrap",
                isActive ? "text-violet-700" : isCompleted ? "text-violet-600" : "text-gray-400"
              )}>
                {step.label}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "absolute top-[22%] left-full h-1 w-full sm:w-24 -translate-y-1/2",
                    isCompleted
                      ? "bg-violet-600"
                      : isActive
                      ? "bg-violet-300"
                      : "bg-gray-200"
                  )}
                  style={{
                    zIndex: 1,
                    // Responsive horizontal line
                    maxWidth: "90px",
                    minWidth: "32px",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
