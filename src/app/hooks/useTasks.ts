import { useMemo, useState } from 'react';
import { Task } from '../../shared/types/regi/tasks';
import { Category } from '../../shared/types/regi/tasks';

export const useTasks = (
  tasks: Task[],
  categories: Category[],
  currentUser: string,
  tasksPerPage = 10
) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('available');
  const [category, setCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (filter === 'available') {
      filtered = filtered.filter(
        (t) => !t.maxParticipants || t.participants.length < t.maxParticipants
      );
    } else if (filter === 'myTasks') {
      filtered = filtered.filter((t) => t.participants.includes(currentUser));
    }

    if (category !== 'all') {
      filtered = filtered.filter((t) => t.category === category);
    }

    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerCaseQuery) ||
          t.category.toLowerCase().includes(lowerCaseQuery) ||
          t.description?.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return filtered;
  }, [tasks, query, filter, category, currentUser]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    return filteredTasks.slice(startIndex, startIndex + tasksPerPage);
  }, [filteredTasks, currentPage, tasksPerPage]);

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Use the categories from the database instead of extracting from tasks
  const availableCategories = useMemo(() => {
    return ['all', ...categories.map((c) => c.name)];
  }, [categories]);

  return {
    query,
    setQuery,
    filter,
    setFilter,
    category,
    setCategory,
    currentPage,
    setCurrentPage,
    paginatedTasks,
    totalPages,
    nextPage,
    prevPage,
    categories: availableCategories,
    filteredTasks,
  };
};
