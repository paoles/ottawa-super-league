"use client";

import { type Course } from "@/lib/constants";

interface StepCourseProps {
  value: Course | null;
  onChange: (course: Course) => void;
}

const DISPLAY_ORDER: Course[] = ["North", "West", "South", "East"];

const COURSE_COLORS: Record<Course, string> = {
  North: "border-emerald-200 bg-emerald-50 text-emerald-900",
  South: "border-rose-200 bg-rose-50 text-rose-900",
  East: "border-blue-200 bg-blue-50 text-blue-900",
  West: "border-amber-200 bg-amber-50 text-amber-900",
};

const COURSE_SELECTED: Record<Course, string> = {
  North: "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-500",
  South: "border-rose-500 bg-rose-100 ring-2 ring-rose-500",
  East: "border-blue-500 bg-blue-100 ring-2 ring-blue-500",
  West: "border-amber-500 bg-amber-100 ring-2 ring-amber-500",
};

export function StepCourse({ value, onChange }: StepCourseProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Which course?</h3>
      <div className="grid grid-cols-2 gap-3">
        {DISPLAY_ORDER.map((course) => (
          <button
            key={course}
            type="button"
            onClick={() => onChange(course)}
            className={`rounded-xl border-2 p-7 text-center transition-all ${
              value === course
                ? COURSE_SELECTED[course]
                : `${COURSE_COLORS[course]} hover:shadow-md`
            }`}
          >
            <p className="text-2xl font-semibold tracking-wide">{course}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
