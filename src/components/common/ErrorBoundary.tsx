// app/_components/ErrorBoundary.tsx
'use client';
import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; err?: any }
> {
  constructor(props:any){ super(props); this.state={hasError:false}; }
  static getDerivedStateFromError(err:any){ return {hasError:true, err}; }
  componentDidCatch(err:any, info:any){ console.error('MyPageError:', err, info); }
  render(){
    if(this.state.hasError){
      return (
        <div className="p-6">
          <h2>エラーが発生しました</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {String(this.state.err?.message ?? this.state.err ?? '')}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
