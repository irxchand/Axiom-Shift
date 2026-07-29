class SourceWorkspaceRuntime:
    def __init__(self, page, adapter_config):
        self.page = page
        self.config = adapter_config

    def create_workspace(self, name: str):
        raise NotImplementedError("Phase 6: Workspace creation not yet implemented")

    def upload_source(self, workspace_id: str, filepath: str):
        raise NotImplementedError("Phase 6: Source upload not yet implemented")
