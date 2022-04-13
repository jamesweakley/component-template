import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode, useEffect } from "react"

interface State {
  myQueryResults: any
  isFocused: boolean
}
declare var parent: any;
/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class MyComponent extends StreamlitComponentBase<State> {
  public state = { myQueryResults: {}, isFocused: false }

  public render = (): ReactNode => {
    
    // Arguments that are passed to the plugin in Python are accessible
    // via `this.props.args`. Here, we access the "name" arg.
    const name = this.props.args["name"]
    const queryResults = this.props.args["query_results"]

    // Streamlit sends us a theme object via props that we can use to ensure
    // that our component has visuals that match the active theme in a
    // streamlit app.
    const { theme } = this.props
    const style: React.CSSProperties = {}

    // Maintain compatibility with older versions of Streamlit that don't send
    // a theme object.
    if (theme) {
      // Use the theme object to style our button border. Alternatively, the
      // theme style is defined in CSS vars.
      const borderStyling = `1px solid ${
        this.state.isFocused ? theme.primaryColor : "gray"
      }`
      style.border = borderStyling
      style.outline = borderStyling
    }

    if (queryResults){
      console.log('posting query results')
      parent.postMessage(queryResults)
    }else{
      //
      //doQuery('select 1');
    }
    

    // Show a button and some text.
    // When the button is clicked, we'll increment our "numClicks" state
    // variable, and send its new value back to Streamlit, where it'll
    // be available to the Python program.
    return (
      <span>
        queryResults: {JSON.stringify(this.state.myQueryResults)}<hr/>
        <button
          style={style}
          onClick={this.onClicked}
          disabled={this.props.disabled}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
        >
          Run query!
        </button>
      </span>
    )
  }

  private doQuery=async (query:string):Promise<any> => {
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
  private onClicked = async (): Promise<void> => {
    // Increment state.numClicks, and pass the new value back to
    // Streamlit via `Streamlit.setComponentValue`.
    console.log('running query');
    var queryResults = await this.doQuery('select 1');
    this.setState({ myQueryResults: queryResults })
    /*this.setState(
      prevState => ({ numClicks: prevState.numClicks + 1 }),
      () => Streamlit.setComponentValue(this.state.numClicks)
    )*/
  }

  /** Focus handler for our "Click Me!" button. */
  private _onFocus = (): void => {
    this.setState({ isFocused: true })
  }

  /** Blur handler for our "Click Me!" button. */
  private _onBlur = (): void => {
    this.setState({ isFocused: false })
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(MyComponent)
