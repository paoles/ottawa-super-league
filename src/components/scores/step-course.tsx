"use client";

import { COURSES, type Course } from "@/lib/constants";

interface StepCourseProps {
  value: Course | null;
  onChange: (course: Course) => void;
}

const COURSE_COLORS: Record<Course, string> = {
  East: "border-blue-300 bg-blue-50 text-blue-900",
  North: "border-emerald-300 bg-emerald-50 text-emerald-900",
  West: "border-amber-300 bg-amber-50 text-amber-900",
  South: "border-rose-300 bg-rose-50 text-rose-900",
};

const COURSE_SELECTED: Record<Course, string> = {
  East: "border-blue-500 bg-blue-100 ring-2 ring-blue-500",
  North: "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-500",
  West: "border-amber-500 bg-amber-100 ring-2 ring-amber-500",
  South: "border-rose-500 bg-rose-100 ring-2 ring-rose-500",
};

export function StepCourse({ value, onChange }: StepCourseProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Which course?</h3>
      <div className="grid grid-cols-2 gap-3">
        {COURSES.map((course) => (
          <button
            key={course}
            type="button"
            onClick={() => onChange(course)}
            className={`rounded-xl border-2 p-6 text-center transition-all ${
              value === course
                ? COURSE_SELECTED[course]
                : `${COURSE_COLORS[course]} hover:shadow-md`
            }`}
          >
            <p className="text-xl font-medium">{course}</p>
            <p className="mt-1 text-sm opacity-70">Par 36</p>
          </button>
        ))}
      </div>
    </div>
  );
}
