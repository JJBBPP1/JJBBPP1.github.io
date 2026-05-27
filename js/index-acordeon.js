document.addEventListener('DOMContentLoaded', () => {
    const detailsElements = document.querySelectorAll('main.acordeon details');
    detailsElements.forEach((detail) => {
        detail.addEventListener('toggle', () => {
            if (detail.open) {
                detailsElements.forEach((otherDetail) => {
                    if (otherDetail !== detail && otherDetail.open) {
                        otherDetail.open = false;
                    }
                });
            }
        });
    });
});
