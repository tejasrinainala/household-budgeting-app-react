import React, { useState, useEffect } from 'react';
import AddExpense from '/Users/tejasrinainala/Desktop/household-budget-app/src/components/AddExpense.js';
import BudgetList from '/Users/tejasrinainala/Desktop/household-budget-app/src/components/BudgetList.js';
import Summary from '/Users/tejasrinainala/Desktop/household-budget-app/src/components/Summary.js';
import '/Users/tejasrinainala/Desktop/household-budget-app/src/index.css';
import 'react-datetime/css/react-datetime.css';
import Income from '/Users/tejasrinainala/Desktop/household-budget-app/src/components/Income.js';
import IncomeList from '/Users/tejasrinainala/Desktop/household-budget-app/src/components/IncomeList.js';

import moment from 'moment';


const App = () => {
  const [budgetItems, setBudgetItems] = useState([]);
  const [incomeItems, setIncomeItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [recurringItems, setRecurringItems] = useState([]);

  useEffect(() => {
    const storedBudgetItems = JSON.parse(localStorage.getItem('budgetItems'));
    if (storedBudgetItems) {
      setBudgetItems(storedBudgetItems);
    }

    const storedIncomeItems = JSON.parse(localStorage.getItem('incomeItems'));
    if (storedIncomeItems) {
      setIncomeItems(storedIncomeItems);
    }

    const storedRecurringItems = JSON.parse(localStorage.getItem('recurringItems'));
    if (storedRecurringItems) {
      setRecurringItems(storedRecurringItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
  }, [budgetItems]);

  useEffect(() => {
    localStorage.setItem('incomeItems', JSON.stringify(incomeItems));
  }, [incomeItems]);

  useEffect(() => {
    localStorage.setItem('recurringItems', JSON.stringify(recurringItems));
  }, [recurringItems]);

  const addExpense = (newExpense) => {
    const formattedDate = selectedDate ? selectedDate.format('DD/MM/YYYY - HH:mm:ss') : null;
    setBudgetItems([...budgetItems, { ...newExpense, id: Date.now(), selectedDate: formattedDate }]);
    setSelectedDate(null);

    if (newExpense.isRecurring) {
      addRecurringItem(newExpense, 'budgetItems');
    }
  };

  const addIncome = (newIncome) => {
    const formattedDate = selectedDate ? selectedDate.format('DD/MM/YYYY - HH:mm:ss') : null;
    const incomeItem = { ...newIncome, id: Date.now(), selectedDate: formattedDate };
    setIncomeItems((prevIncomeItems) => {
      const updatedItems = [...prevIncomeItems, incomeItem];
      localStorage.setItem('incomeItems', JSON.stringify(updatedItems));
      return updatedItems;
    });
    setSelectedDate(null);

    if (newIncome.isRecurring) {
      addRecurringItem(newIncome, 'incomeItems');
    }
  };

  const removeExpense = (id) => {
    const updatedBudgetItems = budgetItems.filter((item) => item.id !== id);
    setBudgetItems(updatedBudgetItems);
    removeRecurringItem(id);
  };

  const removeIncome = (id) => {
    const updatedIncomeItems = incomeItems.filter((item) => item.id !== id);
    setIncomeItems(updatedIncomeItems);
    removeRecurringItem(id);
  };

  const addRecurringItem = (item, itemType) => {
    const nextOccurrence = calculateNextOccurrence(new Date(), item.recurrenceInterval);
    const recurringItem = { ...item, id: Date.now(), itemType, nextOccurrence };
    setRecurringItems([...recurringItems, recurringItem]);
  };

  const removeRecurringItem = (id) => {
    const updatedRecurringItems = recurringItems.filter((item) => item.id !== id);
    setRecurringItems(updatedRecurringItems);
  };

  const calculateNextOccurrence = (currentDate, interval) => {
    const nextDate = moment(currentDate);

    switch (interval) {
      case 'daily':
        return nextDate.add(1, 'days').toString();
      case 'weekly':
        return nextDate.add(1, 'weeks').toString();
      case 'monthly':
        return nextDate.add(1, 'months').toString();
      case 'yearly':
        return nextDate.add(1, 'years').toString();
      default:
        return nextDate.add(1, 'days').toString();
    }
  };

  useEffect(() => {
    const now = moment();
    const newRecurringItems = recurringItems.map((item) => {
      if (moment(item.nextOccurrence).isBefore(now)) {
        const newItem = { ...item, id: Date.now(), selectedDate: now.toString() };
        if (item.itemType === 'incomeItems') {
          setIncomeItems((prevItems) => {
            const updatedItems = [...prevItems, newItem];
            localStorage.setItem('incomeItems', JSON.stringify(updatedItems));
            return updatedItems;
          });
        } else {
          setBudgetItems((prevItems) => {
            const updatedItems = [...prevItems, newItem];
            localStorage.setItem('budgetItems', JSON.stringify(updatedItems));
            return updatedItems;
          });
        }
        item.nextOccurrence = calculateNextOccurrence(now, item.recurrenceInterval);
      }
      return item;
    });

    setRecurringItems(newRecurringItems);
    localStorage.setItem('recurringItems', JSON.stringify(newRecurringItems));
  }, [incomeItems, budgetItems]);

  return (
    <div className="App">
      <Income addIncome={addIncome} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <AddExpense addExpense={addExpense} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <BudgetList budgetItems={budgetItems} removeExpense={removeExpense} />
      <IncomeList incomeItems={incomeItems} removeIncome={removeIncome} />
      <Summary budgetItems={budgetItems} incomeItems={incomeItems} />
    </div>
  );
};

export default App;
