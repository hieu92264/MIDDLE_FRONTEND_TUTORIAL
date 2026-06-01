export declare global {
  type ApiDebug = {
    exception: string
    message: string
    file: string
    line: number
    trace: unknown[]
  }

  type ApiResponse<TMetadata = unknown> = {
    message: string
    status_code: number
    metadata?: TMetadata
    path: string
    timestamp: string
    debug?: ApiDebug
    stack?: string
  }
}

export declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'base' | 'blank'
    guestOnly?: boolean
  }
}
