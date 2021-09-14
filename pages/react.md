- if you have something that isn't important, try doing the following:
  
  ```js
  import { startTransition } from 'react'
  
  const [searchQuery, setSearchQuery] = useState ()
  
  startTransition(_ => {
    setSearchQuery(input);
  });
  ```
  
  it means the update can be interrupted by something more important
- https://blog.asayer.io/the-definitive-guide-to-profiling-react-applications
- Performance:
	- [That React Component Right Under Your Context Provider Should Probably Use `React.memo`](https://twitter.com/sophiebits/status/1228942768543686656?s=20)
	- [guide to rendering](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/#standard-render-behavior)
	- [guide to devtools](https://react-devtools-tutorial.vercel.app)
	- Similarly, note that rendering 
	  ```
	  _ => {
	    const OtherComponent = _ => div ({}) (null)
	    return <MemoizedChild><OtherComponent /></MemoizedChild>
	  }
	  ``` 
	  will also force the child to always render, because props.children is always a new reference. [[source](https://twitter.com/sophiebits/status/1228942768543686656?s=20)]