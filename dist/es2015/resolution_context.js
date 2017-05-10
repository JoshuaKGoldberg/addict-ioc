var ResolutionContext = (function () {
    function ResolutionContext(registration) {
        this.registration = registration;
        this.history = [];
        this.owners = {};
        this.isDependencyOwned = false;
    }
    return ResolutionContext;
}());
export { ResolutionContext };

//# sourceMappingURL=resolution_context.js.map
