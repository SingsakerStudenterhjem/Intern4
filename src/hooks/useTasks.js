import { useMemo, useState } from 'react';

export const useTasks = (tasks, currentUser, tasksPerPage = 10) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('available');
  const [category, setCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (filter === 'available') {
      filtered = filtered.filter((t) => !t.takenBy && !t.completed);
    } else if (filter === 'myTasks') {
      filtered = filtered.filter((t) => t.takenBy === currentUser);
    }

    if (category !== 'all') {
      filtered = filtered.filter((t) => t.category === category);
    }

    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter((t) =>
        Object.values(t).some((val) => String(val).toLowerCase().includes(lowerCaseQuery))
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

  const categories = useMemo(() => {
    const allCategories = tasks.map((t) => t.category);
    return ['all', ...new Set(allCategories)];
  }, [tasks]);

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
    categories,
    filteredTasks,
  };
};
