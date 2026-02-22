'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6 bg-background">
                    <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center shadow-lg">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
                        <p className="text-muted-foreground mb-6">
                            An unexpected error occurred. We've been notified and are working on it.
                        </p>
                        {this.state.error && (
                            <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-[150px]">
                                <p className="text-xs font-mono text-destructive">
                                    {this.state.error.name}: {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            <Button onClick={this.handleRetry} className="w-full gap-2">
                                <RefreshCcw className="w-4 h-4" />
                                Reload Page
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => (window.location.href = '/')}
                                className="w-full"
                            >
                                Go to Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
