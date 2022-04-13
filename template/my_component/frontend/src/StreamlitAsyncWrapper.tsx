import {
  Streamlit,
  Theme,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode, useEffect, useState } from "react"

interface StreamlitPropsState {
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

const StreamlitAsyncWrapper = (props:StreamlitPropsState) => {
  useEffect(() => {
    Streamlit.setFrameHeight();
  });
  const [isFocused, setFocused] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  // Arguments that are passed to the plugin in Python are accessible
  // via `this.props.args`
  const [queryResults, setQueryResults] = useState<any>();

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

  if (props.args["action_results"]){
    console.log('posting action results')
    parent.postMessage(JSON.parse(props.args["action_results"]))
  }

  const doAction=async (action:object):Promise<any> => {
    var iframe:any = document.createElement('iframe');
    const searchUrl=window.location.search;
    const streamlitUrl=decodeURIComponent(searchUrl.replace('?streamlitUrl=',''));
    console.log('opening component at ',streamlitUrl+'?action='+JSON.stringify(action));
    iframe.src = streamlitUrl+'?action='+JSON.stringify(action);
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
  }

  /** Click handler for our "Click Me!" button. */
  const onClicked = async (): Promise<void> => {
    // Increment state.numClicks, and pass the new value back to
    // Streamlit via `Streamlit.setComponentValue`.
    console.log('running query');
    setLoading(true);
    var queryResults = await doAction({'query':'select 1'});
    setQueryResults(queryResults);
    setLoading(false);
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
      {isLoading &&
        <div>
          Loading...
        </div>
      }
      {!isLoading &&
        <div>
          queryResults: {JSON.stringify(queryResults)}<hr/>
        </div>
      }
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
export default withStreamlitConnection(StreamlitAsyncWrapper)
