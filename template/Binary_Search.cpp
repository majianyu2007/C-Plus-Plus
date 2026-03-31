#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int bisearch(int arr[], int n, int target) {
    int left = -1, right = n;
    while (right - left > 1) {
        int mid = left + (right - left) / 2;
        if (arr[mid] <= target) {
            left = mid;
        } else {
            right = mid;
        }
    }
    if (left != -1 && arr[left] == target) {
        return left;
    }
    return -1;
}

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int arr[] = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
    int size = 10;
    int target = 7;

    int result = bisearch(arr, size, target);

    if (result != -1) {
        cout << "Element found at index: " << result << endl;
    } else {
        cout << "Element not found" << endl;
    }

    return 0;
}
