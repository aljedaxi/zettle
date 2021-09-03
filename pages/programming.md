-
-
  > Component A is allowed to use component B when all the following conditions are met: 
  
  > A is essentially simpler because it uses B.
  > B is not substantially more complex because it is not allowed to use A.
  > There is a useful subset containing B but not A.
  > There is no conceivable useful subset containing A but not B. 
  
  > Since A will become simpler to implement because it uses B, that relationship makes sense to exist.
  > We want to avoid cyclic dependencies for all the known reasons, and we also want to keep our components as simple as possible. Situations where two components benefit from using each other, hint that the decomposition needs some rework.
  > It only makes sense for B to exist without A if component B is useful to other components besides A.
  > An implementation of A that doesn’t have the functionality provided by B doesn’t make sense.
  
  [source](i can't remember, look it up lol)