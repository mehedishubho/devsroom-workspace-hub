
import React from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: { label: string }[];
  activeStep: number;
  onStepClick?: (step: number) => void;
  completedStep?: number;
}

const stepColors = [
  "bg-primary", // Done
  "bg-primary/40", // Active
  "bg-muted",      // Inactive
];

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepClick,
  completedStep,
}) => {
  return (
    <nav className="w-full flex justify-center mb-8">
      <ol className="flex flex-row gap-0 w-full max-w-2xl justify-between">
        {steps.map((step, idx) => {
          const isCompleted = completedStep !== undefined && idx < completedStep;
          const isActive = idx === activeStep;
          const colorClass = isCompleted
            ? "bg-vivid-purple text-white"
            : isActive
            ? "bg-primary-purple text-white"
            : "bg-soft-gray text-neutral-gray";

          return (
            <li key={step.label} className="flex-1 flex flex-col items-center relative">
              <button
                onClick={() => onStepClick && onStepClick(idx)}
                className={cn(
                  "w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold z-10 transition-colors duration-200 border-2 border-white shadow",
                  colorClass,
                  onStepClick ? "cursor-pointer" : "cursor-default"
                )}
                aria-current={isActive ? "step" : undefined}
                tabIndex={0}
              >
                {idx + 1}
              </button>
              <span className={cn(
                "text-xs md:text-sm mt-2 text-center font-medium",
                isActive ? "text-primary-purple" : isCompleted ? "text-vivid-purple" : "text-medium-gray"
              )}>
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <span
                  className={cn(
                    "absolute top-1/2 left-full h-1 w-full md:w-24 -translate-y-1/2",
                    isCompleted
                      ? "bg-vivid-purple"
                      : isActive
                      ? "bg-primary-purple/50"
                      : "bg-soft-gray"
                  )}
                  style={{
                    zIndex: 1,
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

