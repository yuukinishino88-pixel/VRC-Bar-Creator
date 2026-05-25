import React, { Component, ErrorInfo, ReactNode } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // エラーログを保存
    try {
      const id = doc(collection(db, 'errorLogs')).id;
      setDoc(doc(db, 'errorLogs', id), {
        id,
        message: error.message,
        stack: error.stack || null,
        route: window.location.pathname,
        userId: auth.currentUser?.uid || null,
        userRole: null, // MockAppContext外なのでここでは取得できない場合がある
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        recovered: false
      });
    } catch (e) {
      console.error('Failed to save error log', e);
    }
  }

  constructor(props: Props) {
    super(props);
    this.handleRetry = this.handleRetry.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  private handleRetry() {
    this.setState({ hasError: false, error: null });
  }

  private handleReload() {
    window.location.reload();
  }

  private handleGoHome() {
    window.location.href = '/';
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#111] p-8 rounded-2xl border border-red-500/30 max-w-lg w-full space-y-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-500 text-3xl">!</span>
            </div>
            
            <div>
              <h1 className="text-xl font-bold tracking-widest text-[#d4af37] mb-2">システムエラーが発生しました</h1>
              <p className="text-gray-400 text-sm">問題が発生したため、安全モードで復旧を試みます。</p>
            </div>

            <div className="bg-black/50 p-4 rounded-lg text-left overflow-auto max-h-32 text-xs text-red-300 font-mono">
              {this.state.error?.message}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={this.handleRetry}
                className="w-full py-3 bg-[#d4af37] text-black font-bold rounded-lg tracking-widest hover:opacity-90 transition"
              >
                再試行 (エラーを無視して続ける)
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition"
              >
                ログアウトせずに再読み込み
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full py-3 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-lg hover:bg-white/10 transition"
              >
                ホームへ戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
