import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode, useEffect } from "react"

interface State {
  numClicks: number
  isFocused: boolean
}
declare var parent: any;
/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class MyComponent extends StreamlitComponentBase<State> {
  public state = { numClicks: 0, isFocused: false }

  

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
    
    
    const doQuery=(query:string) => {
      var iframe:any = document.createElement('iframe');
      const searchUrl=window.location.search;
      const streamlitUrl=decodeURIComponent(searchUrl.replace('?streamlitUrl=',''));
      console.log('opening component at ',streamlitUrl+'?query='+query)
      iframe.src = streamlitUrl+'?query='+query;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.contentWindow.addEventListener('message', (e:any) => {
        const key = e.message ? 'message' : 'data';
        const data = e[key];
        console.log('data',data);
      },false);

      //iframe.contentWindow.body.addEventListener('click',() => console.log('click)))
    }

    if (queryResults){
      console.log('posting query results')
      parent.postMessage(queryResults)
    }else{
      console.log('running query')
      doQuery('select 1');
    }
    
  

    // Show a button and some text.
    // When the button is clicked, we'll increment our "numClicks" state
    // variable, and send its new value back to Streamlit, where it'll
    // be available to the Python program.
    return (
      <span>
        queryResults: {JSON.stringify(queryResults)}<hr/>
        {JSON.stringify(window.location)}<hr/>
        
        <b>href</b>:{window.location.href}<hr/>
        <b>origin</b>:{window.location.origin}
        <hr/>
        Hello, {name}! &nbsp;
        <button
          style={style}
          onClick={this.onClicked}
          disabled={this.props.disabled}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
        >
          Click Me!
        </button>
      </span>
    )
  }

  /** Click handler for our "Click Me!" button. */
  private onClicked = (): void => {
    // Increment state.numClicks, and pass the new value back to
    // Streamlit via `Streamlit.setComponentValue`.
    this.setState(
      prevState => ({ numClicks: prevState.numClicks + 1 }),
      () => Streamlit.setComponentValue(this.state.numClicks)
    )
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
