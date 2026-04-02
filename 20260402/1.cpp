#include <iostream>
using namespace std;
template <typename T> void bubble_sort(T *items, int count) {
    int a, b;
    int number_compare = 0;
    int number_move = 0;
    for (a = 1; a < count; a++) {
        bool indicator = 0;
        for (b = count - 1; b >= a; b--) {
            number_compare++;
            if (items[b - 1] > items[b]) {
                number_move++;
                T t = items[b - 1];
                items[b - 1] = items[b];
                items[b] = t;
                indicator = 1;
            }
        }
        if (indicator == 0)
            break;
    }
    cout << "Number of comparisons: " << number_compare << endl;
    cout << "Number of moves: " << number_move << endl;
}
int main(void) {
    int arr[] = {5, 4, 3, 2, 1};
    int len = (int)sizeof(arr) / sizeof(*arr);
    bubble_sort(arr, len);
    for (int i = 0; i < len; i++)
        cout << arr[i] << ' ';
    cout << endl;

    float arrf[] = {17.5f, 19.1f, 0.6f, 1.9f, 10.5f};
    len = (int)sizeof(arrf) / sizeof(*arrf);
    bubble_sort(arrf, len);
    for (int i = 0; i < len; i++)
        cout << arrf[i] << ' ';
    cout << endl;

    char arrc[] = {'g', 'f', 'd', 's', 'a'};
    len = (int)sizeof(arrc) / sizeof(*arrc);
    bubble_sort(arrc, len);
    for (int i = 0; i < len; i++)
        cout << arrc[i] << ' ';
    cout << endl;

    return 0;
}
