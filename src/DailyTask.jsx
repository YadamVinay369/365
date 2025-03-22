import { useState, useEffect } from "react";
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
} from "react-icons/io";
import { toast } from "react-hot-toast";
import tasks from "./plan";

const DailyTask = () => {
  const [currentDay, setCurrentDay] = useState(
    () => Number(localStorage.getItem("currentDay")) || 1
  );
  const [completedTasks, setCompletedTasks] = useState(
    () => JSON.parse(localStorage.getItem("completedTasks")) || []
  );
  const [learnings, setLearnings] = useState(
    () => JSON.parse(localStorage.getItem("learnings")) || {}
  );
  const [expanded, setExpanded] = useState({});
  const [learningDraft, setLearningDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [truncationLimit, setTruncationLimit] = useState(100);

  useEffect(() => {
    localStorage.setItem("currentDay", currentDay);
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    localStorage.setItem("learnings", JSON.stringify(learnings));
  }, [currentDay, completedTasks, learnings]);

  useEffect(() => {
    setLearningDraft(learnings[currentDay] || "");
  }, [currentDay, learnings]);

  useEffect(() => {
    const updateTruncationLimit = () => {
      const width = window.innerWidth;
      if (width < 640) setTruncationLimit(50); // Mobile
      else if (width < 1024) setTruncationLimit(100); // Tablet
      else setTruncationLimit(150); // Desktop
    };

    updateTruncationLimit();
    window.addEventListener("resize", updateTruncationLimit);
    return () => window.removeEventListener("resize", updateTruncationLimit);
  }, []);

  const handleLearningChange = (e) => {
    setLearningDraft(e.target.value);
  };

  const handleSaveLearning = () => {
    if (learningDraft.trim().length === 0) {
      toast.error("Please add some text before saving.");
      return;
    }
    setLearnings({ ...learnings, [currentDay]: learningDraft });
    toast.success("Learning saved successfully!");
    setIsEditing(false);
  };

  const handleEditLearning = () => {
    setIsEditing(true);
    setLearningDraft(learnings[currentDay]);
  };

  const handleComplete = () => {
    if (
      currentDay < tasks.length &&
      !completedTasks.some((t) => t.day === currentDay)
    ) {
      setCompletedTasks([
        ...completedTasks,
        { day: currentDay, task: tasks[currentDay - 1] },
      ]);
      setCurrentDay(currentDay + 1);
      setLearningDraft("");
      setIsEditing(false);
    }
  };

  const handleResetPrevious = () => {
    if (currentDay > 1) {
      const updatedCompletedTasks = completedTasks.slice(0, -1);
      setCompletedTasks(updatedCompletedTasks);
      setCurrentDay(currentDay - 1);

      const newLearnings = { ...learnings };
      delete newLearnings[currentDay - 1];
      setLearnings(newLearnings);

      // Remove from localStorage
      localStorage.setItem(
        "completedTasks",
        JSON.stringify(updatedCompletedTasks)
      );
      localStorage.setItem("learnings", JSON.stringify(newLearnings));
    }
  };

  const toggleExpand = (day) => {
    setExpanded({ ...expanded, [day]: !expanded[day] });
  };

  const truncateText = (text) => {
    return text.length > truncationLimit
      ? text.slice(0, truncationLimit) + "..."
      : text;
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-[#152736]">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-6 text-white">RoadMap</h1>

      <button
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        onClick={handleResetPrevious}
      >
        Back
      </button>

      {/* Current Task */}
      <div className="w-full max-w-3xl bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-lg font-bold">Day {currentDay}</h2>
        <p className="text-gray-700">{tasks[currentDay - 1]}</p>

        {!isEditing ? (
          learnings[currentDay] ? (
            <div className="mt-2 bg-gray-100 p-2 rounded flex justify-between items-center">
              <p className="flex-1 break-words whitespace-pre-wrap overflow-hidden">
                {learnings[currentDay]}
              </p>
              <button
                className="ml-4 bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700 transition"
                onClick={handleEditLearning}
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Write what you learned today..."
                value={learningDraft}
                onChange={handleLearningChange}
              />
              <button
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                onClick={handleSaveLearning}
              >
                Save Learning
              </button>
            </div>
          )
        ) : (
          <div className="mt-2">
            <textarea
              className="w-full p-2 border rounded"
              value={learningDraft}
              onChange={handleLearningChange}
            />
            <button
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              onClick={handleSaveLearning}
            >
              Save
            </button>
          </div>
        )}

        <button
          className="mt-4 bg-[#152736] text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
          onClick={handleComplete}
        >
          Mark as Completed
        </button>
      </div>

      {/* Completed Tasks */}
      <div className="w-full max-w-3xl">
        {completedTasks
          .slice()
          .reverse()
          .map((task) => (
            <div key={task.day} className="bg-gray-200 p-4 rounded-md mb-2">
              <h2 className="text-lg font-bold">Day {task.day}</h2>
              <p className="text-gray-700">{task.task}</p>
              <div className="mt-2 bg-white p-2 rounded whitespace-pre-wrap break-all flex justify-between">
                <span>
                  {expanded[task.day]
                    ? learnings[task.day]
                    : truncateText(learnings[task.day] || "")}
                </span>
                {learnings[task.day] &&
                  learnings[task.day].length > truncationLimit && (
                    <button
                      className="text-blue-500 ml-2"
                      onClick={() => toggleExpand(task.day)}
                    >
                      {expanded[task.day] ? (
                        <IoIosArrowDropupCircle />
                      ) : (
                        <IoIosArrowDropdownCircle />
                      )}
                    </button>
                  )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DailyTask;
