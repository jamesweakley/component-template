import {
  Streamlit,
  StreamlitComponentBase,
  Theme,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode, useEffect, useState } from "react"

interface State {
  args: any;
  /** The component's width. */
  width: number;
  /**
   * True if the component should be disabled.
   * All components get disabled while the app is being re-run,
   * and become re-enabled when the re-run has finished.
   */
  disabled: boolean;
  /** Theme definition dictionary passed from the main client.*/
  theme?: Theme;
}
declare var parent: any;
/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
const MyComponent = (props:State) => {
  useEffect(() => {
    Streamlit.setFrameHeight();
  });
  const [isFocused, setFocused] = useState<boolean>(false);
  // Arguments that are passed to the plugin in Python are accessible
  // via `this.props.args`
  const [queryResults, setQueryResults] = useState<any>(props.args["query_results"]);
    
//class MyComponent extends StreamlitComponentBase<State> {
  //public state = { myQueryResults: {}, isFocused: false }

  const { theme } = props
  const style: React.CSSProperties = {}

  // Maintain compatibility with older versions of Streamlit that don't send
  // a theme object.
  if (theme) {
    // Use the theme object to style our button border. Alternatively, the
    // theme style is defined in CSS vars.
    const borderStyling = `1px solid ${
      isFocused ? theme.primaryColor : "gray"
    }`
    style.border = borderStyling
    style.outline = borderStyling
  }

  if (queryResults){
    console.log('posting query results')
    parent.postMessage(queryResults)
  }

  const doQuery=async (query:string):Promise<any> => {
    var iframe:any = document.createElement('iframe');
    const searchUrl=window.location.search;
    const streamlitUrl=decodeURIComponent(searchUrl.replace('?streamlitUrl=',''));
    console.log('opening component at ',streamlitUrl+'?query='+query)
    iframe.src = streamlitUrl+'?query='+query;
    iframe.style.display = 'none';
    var iframeElement = document.body.appendChild(iframe);
    return new Promise(function(resolve){
      iframe.contentWindow.addEventListener('message', (e:any) => {
        const key = e.message ? 'message' : 'data';
        const data = e[key];
        console.log('data',data);
        if (data.isStreamlitMessage===undefined){
          document.body.removeChild(iframeElement);
          resolve(data);
        }
      },false);
  });

    //iframe.contentWindow.body.addEventListener('click',() => console.log('click)))
  }

  /** Click handler for our "Click Me!" button. */
  const onClicked = async (): Promise<void> => {
    // Increment state.numClicks, and pass the new value back to
    // Streamlit via `Streamlit.setComponentValue`.
    console.log('running query');
    var queryResults = await doQuery('select 1');
    setQueryResults(queryResults);
    /*this.setState(
      prevState => ({ numClicks: prevState.numClicks + 1 }),
      () => Streamlit.setComponentValue(this.state.numClicks)
    )*/
  }

  /** Focus handler for our "Click Me!" button. */
  const _onFocus = (): void => {
    setFocused(true);
  }

  /** Blur handler for our "Click Me!" button. */
  const _onBlur = (): void => {
    setFocused(false);
  }
  

  // Show a button and some text.
  // When the button is clicked, we'll increment our "numClicks" state
  // variable, and send its new value back to Streamlit, where it'll
  // be available to the Python program.
  return (
    <span>
      queryResults: {JSON.stringify(queryResults)}<hr/>
      <button
        style={style}
        onClick={onClicked}
        disabled={props.disabled}
        onFocus={_onFocus}
        onBlur={_onBlur}
      >
        Run query!
      </button>
    </span>
  )
}


// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(MyComponent)
