// import React, { useState, createContext } from 'react';

// // Define the type for the context value
// type ContextValueType = [StateType, React.Dispatch<React.SetStateAction<StateType>>];

// // Define the type for the state
// type StateType = {
//   courses: any[];
//   filteredCourses: any[];
//   searchParam: string;
// };

// // Create the context with the correct type
// export const FilterContext: React.Context<any> = createContext<ContextValueType>([{
//   courses: [],
//   filteredCourses: [],
//   searchParam: ''
// }, () => { }]);

// const FilterStore = ({ children }) => {
//   const [state, setState] = useState<StateType>({
//     courses: [],
//     filteredCourses: [],
//     searchParam: '',
//   });

//   return (
//     <FilterContext.Provider value={[state, setState]}>{children}</FilterContext.Provider>
//   );
// };

// export default FilterStore;


import React, { useState, createContext } from 'react';

export const Context = createContext('' as any);

const FilterStore = ({ children }) => {
  const [state, setState] = useState({
    courses: [],
    filteredCourses: [],
    searchParam: '',
  });

  return (
    <Context.Provider value={[state, setState]}>{children}</Context.Provider>
  );
};

export default FilterStore;
