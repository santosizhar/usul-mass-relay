export type ExecutionLane = "python";

export type FilesystemMode = "read-only" | "read-write" | "deny-all";

export type NetworkMode = "allowlist" | "deny-all";

export interface SandboxFilesystemPolicy {
  mode: FilesystemMode;
  read_paths: string[];
  write_paths: string[];
}

export interface SandboxNetworkPolicy {
  mode: NetworkMode;
  allow_hosts: string[];
  allow_ports: number[];
}

export interface SandboxEnvironmentPolicy {
  allowlist: string[];
}

export interface SandboxResourceLimits {
  cpu_cores: number;
  memory_mb: number;
  timeout_seconds: number;
}

export interface SandboxLoggingPolicy {
  redact_patterns: string[];
}

export interface ExecutionSandbox {
  sandbox_id: string;
  name: string;
  version: string;
  owner: string;
  created_at: string;
  updated_at: string;
  execution_lane: ExecutionLane;
  filesystem: SandboxFilesystemPolicy;
  network: SandboxNetworkPolicy;
  environment: SandboxEnvironmentPolicy;
  resources: SandboxResourceLimits;
  logging: SandboxLoggingPolicy;
}
